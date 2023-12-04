const axios = require('axios');
const Species = require('../models/speciesBangla');
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

exports.translate = async (req, res) => {
    const text = req.query.word;
    const sourceLang = req.query.source_lang;
    const destLang = req.query.dest_lang;

    const options = {
        method: 'GET',
        url: 'https://google-translator8.p.rapidapi.com/translate',
        params: {
            word: text,
            source_lang: sourceLang,
            dest_lang: destLang
          },
        headers: {
            'X-RapidAPI-Key': '53219388e7msh2e4d55bcec5365cp1b7e25jsn8d270797740b',
            'X-RapidAPI-Host': 'google-translator8.p.rapidapi.com'
          }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}


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
    const treeName = req.query.treeName;
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(treeName)}`;

    const axiosConfig = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
    };

    try {
        const response = await axios.get(url, axiosConfig);
        const data = parseWikiData(response.data);
        res.json(data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).send(`Wikipedia page not found for ${treeName}`);
        } else {
            console.error('Error fetching tree data from Wikipedia:', error);
            res.status(500).send('Internal Server Error');
        }
    }
};



function parseWikiData(html) {
    const $ = cheerio.load(html);
    let intro, description, ecology, uses;

    try {
        intro = getIntroParagraph($) || 'Introduction not available';
    } catch (error) {
        console.error('Error fetching Introduction:', error);
        intro = 'Introduction not available';
    }

    try {
        description = getSectionContent($, 'Description') || 'Description not available';
    } catch (error) {
        console.error('Error fetching Description:', error);
        description = 'Description not available';
    }

    try {
        ecology = getSectionContent($, 'Ecology') || 'Ecology information not available';
    } catch (error) {
        console.error('Error fetching Ecology:', error);
        ecology = 'Ecology information not available';
    }

    try {
        uses = getSectionContent($, 'Uses') || 'Uses information not available';
    } catch (error) {
        console.error('Error fetching Uses:', error);
        uses = 'Uses information not available';
    }

    return { introduction: intro, description: description, ecology: ecology, uses: uses };
}



function getIntroParagraph($) {
    const infobox = $('table.infobox');
    return infobox.length ? infobox.next('p').text().trim() : $('p').first().text().trim() || null;
}


function getSectionContent($, title) {
    let content = '';
    const heading = $(`span#${title}`).parent();

    if (heading.length) {
        let currentElem = heading.next();

        while (currentElem.length && !currentElem.is('h2')) {
            content += currentElem.text();
            currentElem = currentElem.next();
        }

        return content.trim() || null;
    } else {
        return null;
    }
}
