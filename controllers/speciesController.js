const axios = require('axios');
const Species = require('../models/species');
const SpeciesBangla = require('../models/speciesBangla');
const translate = require('google-translate-open-api').default;
const createHttpProxyAgent = require('http-proxy-agent');


// const translate = new Translate();
 
exports.getSpecies = async (req, res) => {
    try {
        const perPage = req.query.perpage || 30; // Number of items per page
        let page = req.query.page || 1; // Page number from the query parameter, default is 1

        // Convert page to a number in case it's a string
        page = Number(page);

        // Calculate the number of documents to skip
        const skip = (page - 1) * perPage;

        // Fetch the paginated data from the database
        const speciesData = await Species.find().skip(skip).limit(perPage);

        // Send the paginated data as a response
        res.json({
            currentPage: page,
            perPage: perPage,
            data: speciesData
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};



// async function translateToBangla(text) {
//     try {
//         let [translations] = await translate.translate(text, 'bn'); // 'bn' is the language code for Bangla
//         return translations;
//     } catch (error) {
//         console.error('Error in translation:', error);
//         return text; // return the original text if translation fails
//     }
// }



// async function translateToBangla(text) {
//     const agent = createHttpProxyAgent('http://103.152.112.162:80');

//     try {
//         const result = await translate(text, {
//             to: 'bn',
//             fetchOptions: { agent },
//         });
//         return result.text;
//     } catch (error) {
//         console.error('Error in translation:', error);
//         return text; // Return the original text if translation fails
//     }
// }


async function translateToBangla(text) {
    const options = {
    method: 'GET',
    url: 'https://google-translator8.p.rapidapi.com/translate',
    params: {
        word: text,
        source_lang: 'en',
        dest_lang: 'bn'
    },
    headers: {
        'X-RapidAPI-Key': '53219388e7msh2e4d55bcec5365cp1b7e25jsn8d270797740b',
        'X-RapidAPI-Host': 'google-translator8.p.rapidapi.com'
    }
    };

    try {
        const response = await axios.request(options);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }


    // try {
    //     const result = await translate(text, { to: 'bn' });
    //     return result.data[0];
    // } catch (error) {
    //     console.error('Error in translation:', error);
    //     return text; // Return the original text if translation fails
    // }
}


exports.translateAndStore = async (req, res) => {
    try {
        const allSpecies = await Species.find();

        for (const species of allSpecies) {
            let translatedSpecies = {
                id: species.id,
                common_name: await translateToBangla(species.common_name),
                scientific_name: species.scientific_name, // Assuming you don't want to translate this
                other_name: await translateToBangla(species.other_name[0]),
                cycle: await translateToBangla(species.cycle),
                watering: await translateToBangla(species.watering),
                sunlight: await translateToBangla(species.sunlight[0]),
                default_image: species.default_image
            };

            await SpeciesBangla.create(translatedSpecies);
            console.log(`Translation and storage complete for ${species.common_name}`);
        }

        res.send('Translation and storage complete.');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

