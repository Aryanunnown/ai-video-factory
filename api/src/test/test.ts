import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function test() {
  try {
    const response =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "user",
            content: `
Generate JSON only.

Topic:
How AI agents replace repetitive work

Return:

{
 "title":"",
 "scenes":[
   {
     "orderNo":1,
     "text":"",
     "visual":"",
     "duration":8
   }
 ]
}

Generate exactly 5 scenes.
`
          }
        ],

        temperature: 0.7
      });

    console.log(
      response.choices[0]
        ?.message
        ?.content
    );

  } catch (err) {
    console.error(err);
  }
}

test();