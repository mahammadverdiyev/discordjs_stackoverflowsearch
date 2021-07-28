const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js')

exports.search = async function (question) {
    if (!question.includes('stackoverflow') || !question.includes('stack'))
        question += ' stackoverflow';

    let searchUrl = `https://www.google.com/search?&q=${question}`;

    const resultLinks = await extractLinks(searchUrl);

    if (resultLinks.length) {
        const firstLink = resultLinks[0];
        const address = firstLink.href;
        const id = getQuestionId(address);
        const stackApiUrl = getStackApiUrl(id);
        const response = await fetch(stackApiUrl);
        const json = await response.json();

        const embedMessage = await makeStackoverflowEmbed(json);
        return embedMessage;
    }
    else {
        return `Could not find any result about "${question}"`;
    }
}

function getQuestionId(url) {
    let filteredUrl = '';
    if (url.includes('questions')) {
        filteredUrl = url.replace('/url?q=https://stackoverflow.com/questions/', '').trim();
    }
    else {
        filteredUrl = url.replace('/url?q=https://stackoverflow.com/q/', '').trim();
    }
    const characters = filteredUrl.split('');
    let id = '';
    for (let character of characters) {
        if (character >= '0' && character <= '9') {
            id += character;
        }
        else {
            return id;
        }
    }
}

const extractLinks = async (url) => {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const linkObjects = $('a');
        const links = [];
        linkObjects.each((index, element) => {
            const questionUrl = $(element).attr('href');
            if (questionUrl.includes('stackoverflow.com') && questionUrl.includes('url') && !questionUrl.includes('.blog')) {
                links.push({
                    text: $(element).text(),
                    href: $(element).attr('href'),
                });
            }
        });
        return links;
    } catch (error) {
        console.log("ERROR OCCURRED " + error);
    }
};

async function makeStackoverflowEmbed(jsonData) {
    const item = jsonData.items[0];
    const owner = item.owner;
    const tags = item.tags;
    const title = item.title;
    const link = item.link;
    const owner_p_image = owner.profile_image;
    const owner_name = owner.display_name;

    const description = await getQuestionBody(link);

    const embed = new MessageEmbed()
        .setTitle(title)
        .setThumbnail(owner_p_image)
        .setAuthor(owner_name)
        .setFooter(tags.join(' '))
        .setURL(link)
        .setColor('RANDOM')
        .setDescription(description);
    return embed;
}


async function getQuestionBody(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const questionBodyElement = $(".postcell > div:nth-child(1)");
        const valid_elements = questionBodyElement[0].children.filter(node => node.name && node.name !== 'div')

        const digData = (element) => {
            const innerText = element.children.map(child => {
                if (child.type === 'text') {
                    return child.data.trim();
                }
                else if (child.children && child.children.length) {
                    return digData(child);
                }
            }).join(' ');
            return innerText;
        }


        const text = valid_elements.map(element => {
            return digData(element);
        })

        return text;
    } catch (error) {

    }
}



function getStackApiUrl(id) {
    const stackUrl = `http://api.stackexchange.com/2.3/questions/${id}?order=desc&sort=activity&site=stackoverflow`
    return stackUrl
}