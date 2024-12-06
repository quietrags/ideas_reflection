from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import groq
import os
from dotenv import load_dotenv
import json
import logging

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

@app.post("/analyze")
async def analyze_text(input_data: TextInput) -> AnalysisResponse:
    try:
        # Log the input text
        logger.info("Analyzing text:")
        logger.info("=" * 80)
        logger.info(input_data.text)
        logger.info("=" * 80)
        
        # Call Groq API
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": input_data.text}
                ],
                model="llama-3.1-70b-versatile",
                temperature=0.7,
                max_tokens=4000,
                top_p=0.9,
            )
        except Exception as api_error:
            error_message = str(api_error).lower()
            if "rate limit" in error_message:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please try again in a few minutes."
                )
            raise HTTPException(
                status_code=500,
                detail=f"API Error: {str(api_error)}"
            )
        
        # Extract and parse the response
        response_text = chat_completion.choices[0].message.content
        
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

            # Log the structured response with detailed sections
            logger.info("\n" + "="*50)
            logger.info("PARSED OUTPUT STRUCTURE:")
            logger.info("="*50)
            
            logger.info("\n1. CORE IDEAS:")
            logger.info("-"*30)
            logger.info("\nMAIN IDEAS:")
            for item in structured_response["core_ideas"]["main_ideas"]:
                logger.info(f"  • [{item['id']}] {item['content']}")
            
            logger.info("\nSUPPORTING IDEAS:")
            for item in structured_response["core_ideas"]["supporting_ideas"]:
                logger.info(f"  • [For {item['main_idea_id']}] {item['content']}")
            
            logger.info("\nCONTEXTUAL ELEMENTS:")
            for item in structured_response["core_ideas"]["contextual_elements"]:
                logger.info(f"  • [{item['id']}] {item['content']}")
            
            logger.info("\nCOUNTERPOINTS:")
            for item in structured_response["core_ideas"]["counterpoints"]:
                logger.info(f"  • [For {item['main_idea_id']}] {item['content']}")
            
            logger.info("\nRELATIONSHIPS BETWEEN MAIN IDEAS:")
            for item in structured_response["core_ideas"]["relationships_between_main_ideas"]:
                logger.info(f"  • {item['idea1']} {item['type']} {item['idea2']}: {item['description']}")
            
            logger.info("\n2. RELATIONSHIPS:")
            logger.info("-"*30)
            for item in structured_response["relationships"]["items"]:
                logger.info(f"  • [{item['type']}] {item['description']}")
            
            logger.info("\n3. ANALOGIES:")
            logger.info("-"*30)
            for item in structured_response["analogies"]["items"]:
                logger.info(f"  • [{item['id']}]")
                logger.info(f"    Comparison: {item['comparison']}")
                logger.info(f"    Support: {item['support']}")
                logger.info(f"    Implications: {item['implications']}")
            
            logger.info("\n4. INSIGHTS:")
            logger.info("-"*30)
            logger.info(f"\nEvolution: {structured_response['insights']['evolution']}")
            logger.info(f"\nKey Takeaways: {structured_response['insights']['key_takeaways']}")
            logger.info(f"\nTradeoffs: {structured_response['insights']['tradeoffs']}")
            logger.info(f"\nBroader Themes: {structured_response['insights']['broader_themes']}")
            
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
