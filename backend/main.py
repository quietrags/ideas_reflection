from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import groq
import os
from dotenv import load_dotenv
import json
import logging
import time
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

class TextInput(BaseModel):
    text: str

class AnalysisResponse(BaseModel):
    analysis: dict

# Load the system prompt from file
with open("prompt.txt", "r") as f:
    SYSTEM_PROMPT = f.read()

class RateLimitError(Exception):
    pass

async def call_groq_with_retry(messages: list, max_retries: int = 3, initial_wait: int = 60) -> Optional[str]:
    """
    Call Groq API with exponential backoff retry logic
    """
    for attempt in range(max_retries):
        try:
            chat_completion = client.chat.completions.create(
                messages=messages,
                model="llama-3.1-70b-versatile",
                temperature=0.7,
                max_tokens=4000,
                top_p=0.9,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            error_message = str(e).lower()
            if "rate limit" in error_message:
                wait_time = initial_wait * (2 ** attempt)  # Exponential backoff
                logger.warning(f"Rate limit hit. Waiting {wait_time} seconds before retry {attempt + 1}/{max_retries}")
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                    continue
                raise RateLimitError("Rate limit exceeded and max retries reached")
            raise e
    return None

@app.post("/analyze")
async def analyze_text(input_data: TextInput, background_tasks: BackgroundTasks) -> AnalysisResponse:
    try:
        # Log the input text
        logger.info("Analyzing text:")
        logger.info("=" * 80)
        logger.info(input_data.text)
        logger.info("=" * 80)
        
        # Call Groq API with retry logic
        try:
            response_text = await call_groq_with_retry([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": input_data.text}
            ])
            
            if not response_text:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to get response from AI service"
                )
                
        except RateLimitError:
            return AnalysisResponse(
                analysis={
                    "status": "error",
                    "error": "Rate limit exceeded. Please try again in about an hour.",
                    "retry_after": 3600  # 1 hour in seconds
                }
            )
        except Exception as api_error:
            logger.error(f"API Error: {str(api_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"API Error: {str(api_error)}"
            )
        
        # Extract and parse the response
        response_text = response_text
        
        # Log the raw response
        logger.info("Raw LLM Response:")
        logger.info("=" * 80)
        logger.info(response_text)
        logger.info("=" * 80)
        
        try:
            # Clean up the response text - remove markdown code block if present
            if "```" in response_text:
                # Extract content between the first and last ```
                response_text = response_text.split("```")[1]
                # If the extracted content starts with 'json', remove it
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            # Parse the JSON response
            parsed_response = json.loads(response_text.strip())
            
            # Structure the response for frontend accordion
            structured_response = {
                "core_ideas": {
                    "main_ideas": [{"id": item["ID"], "content": item["Description"]} 
                                 for item in parsed_response["CoreIdeas"]["MainIdeas"]],
                    "supporting_ideas": [{"main_idea_id": item["MainIdeaID"], "content": item["Description"]} 
                                      for item in parsed_response["CoreIdeas"]["SupportingIdeas"]],
                    "contextual_elements": [{"id": item["ID"], "content": item["Description"]} 
                                         for item in parsed_response["CoreIdeas"]["ContextualElements"]],
                    "counterpoints": [{"main_idea_id": item["MainIdeaID"], "content": item["Description"]} 
                                   for item in parsed_response["CoreIdeas"]["Counterpoints"]],
                    "relationships_between_main_ideas": [
                        {
                            "idea1": rel["MainIdea1"],
                            "idea2": rel["MainIdea2"],
                            "type": rel["Type"],
                            "description": rel["Description"]
                        }
                        for rel in parsed_response["RelationshipsBetweenMainIdeas"]
                    ]
                },
                "relationships": {
                    "items": [
                        {
                            "type": rel["Type"],
                            "description": rel["Description"]
                        }
                        for rel in parsed_response["Relationships"]
                    ]
                },
                "analogies": {
                    "items": [
                        {
                            "id": analogy["AnalogyID"],
                            "comparison": analogy["Comparison"],
                            "support": analogy["SupportForMainIdea"],
                            "implications": analogy["ImplicationsOrRisks"]
                        }
                        for analogy in parsed_response["Analogies"]
                    ]
                },
                "insights": {
                    "evolution": parsed_response["UpdatedInsights"]["EvolutionOfIdeas"],
                    "key_takeaways": parsed_response["UpdatedInsights"]["KeyTakeaways"],
                    "tradeoffs": parsed_response["UpdatedInsights"]["TradeoffsOrRisks"],
                    "broader_themes": parsed_response["UpdatedInsights"]["BroaderThemes"]
                }
            }

            print("\n================================================================================")
            print("LLM RESPONSE:")
            print("================================================================================")
            print(response_text)
            
            print("\n================================================================================")
            print("PARSED OUTPUT SENT TO FRONTEND:")
            print("================================================================================")
            print(json.dumps(structured_response, indent=2))
            print("================================================================================\n")
            
            return AnalysisResponse(analysis=structured_response)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error("Raw response that failed to parse:")
            logger.error(response_text)
            raise HTTPException(status_code=500, detail="Failed to parse LLM response as JSON")
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
