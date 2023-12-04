const axios = require('axios');
const Species = require('../models/species');
const SpeciesBangla = require('../models/speciesBangla');
const cheerio = require('cheerio'); // Add cheerio for HTML parsing


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


async function translateToBangla(text) {
    const options = {
    method: 'GET',
    url: 'http://127.0.0.1:7071/translate',
    params: {
        word: text,
        source_lang: 'en',
        dest_lang: 'bn'
    }
    };

    try {
        const response = await axios.request(options);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
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

exports.fetchTreeWikiInfo = async (req, res) => {
    console.log('Fetching tree info from Wikipedia...');
    const treeName = req.query.treeName
    console.log(treeName);
    const url = `https://en.wikipedia.org/wiki/${treeName.replace(' ', '_')}`;

    try {
        console.log(url);
        const response = await axios.get(url);
        const data = parseWikiData(response.data);
        console.log(data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching tree data from Wikipedia:', error);
        throw error;
    }
}

function parseWikiData(html) {
    const $ = cheerio.load(html);
    const intro = getIntroParagraph($);
    const description = getSectionContent($, 'Description');
    const ecology = getSectionContent($, 'Ecology');
    const uses = getSectionContent($, 'Uses');

    return {
        introduction: intro,
        description: description,
        ecology: ecology,
        uses: uses
    };
}

function getIntroParagraph($) {
    const infobox = $('table.infobox');
    const introParagraph = infobox.length ? infobox.find('+ p').text().trim() : $('p').first().text().trim();
    return introParagraph;
}

function getSectionContent($, title) {
    const heading = $(`span#${title}`);
    if (heading.length) {
        let content = '';
        let currentElem = heading.parent().next();

        while (currentElem.length && !currentElem.is('h2')) {
            content += currentElem.text();
            currentElem = currentElem.next();
        }

        return content.trim();
    }
    return null;
}
