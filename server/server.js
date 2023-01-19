import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Зиак ороод ирсэн үү? ChatGPT-г Монгол хэл дээр туршаад үзэхэд бэлэн биз дээ?',
    })
});

import { v2 } from '@google-cloud/translate'

async function translateText(text, target) {
    const translate = new v2.Translate({ 'apiEndpoint': 'translation.googleapis.com' });
    const [translation] = await translate.translate(text, target);
    return translation;
}

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        if (prompt.match(/[a-z]/i)) {
            const error = 'Одоогоор латин үсгээр бичигдсэн, чат/мэссэжний хэллэг арай ойлгохгүй байна. Харин та Монголоор, үг үсгийн алдаагүй бичээд асуултаа асуугаад үзээрэй. ☺️'
            console.log(error);
            res.status(200).send({
                bot: error,
            })
        } else {
            const translatedPrompt = await translateText(prompt, 'en-US');
            console.log(translatedPrompt);
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `${translatedPrompt}`,
                temperature: 0,
                max_tokens: 3000,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
            })
            console.log(response.data.choices[0].text);
            const translatedResponse = await translateText(response.data.choices[0].text, 'mn-MN');
            console.log(translatedResponse);
            res.status(200).send({
                bot: translatedResponse,
            })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }
})

app.listen(5050, () => console.log('Server is running on port http://localhost:5050'));