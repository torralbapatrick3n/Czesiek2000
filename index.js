const express = require('express');
const axios = require('axios');

const app = express();

function addZero(number) {
    return number < 10 ? '0' + number : number;
}

function lastActiveText(lastActive) {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diff = now.getTime() - lastActiveDate.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
        return `${years} years ago`;
    } else if (months > 0) {
        return `${months} months ago`;
    } else if (days > 0) {
        return `${days} days ago`;
    } else if (hours > 0) {
        return `${hours} hours ago`;
    } else if (minutes > 0) {
        return `${minutes} minutes ago`;
    } else {
        return 'less than a minute ago';
    }
}

function formatDate(date, format) {
    if (format === 0) {
        return `${addZero(date.getDate())}/${addZero(date.getMonth() + 1)}/${date.getFullYear()}`;
    } else if (format === 1) {
        return `${addZero(date.getDate())}/${addZero(date.getMonth() + 1)}/${date.getFullYear()} ${addZero(date.getHours())}:${addZero(date.getMinutes())}`;
    } else if (format === 2) {
        console.log(lastActiveText(date));
        return lastActiveText(date);
    } else if (format === 3) {
        // create array of months strings
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } else {
        return date.getFullYear() + '-' + addZero(date.getMonth() + 1) + '-' + addZero(date.getDate());
    }
}

app.get('/badge', async (req, res) => {
    let username = req.query.username;
   
    axios.get(`https://gitlab.com/api/v4/users/${username}/projects?statistics=true${`${req.query.token !== undefined ? `&access_token=${req.query.token}` : ''}`}`)
    .then(response => {
        let date = formatDate(new Date(response.data.find(p => p.id === parseInt(req.query.id)).last_activity_at), parseInt(req.query.format));
        
        let data = {
            projectId: response.data.find(p => p.id === parseInt(req.query.id)).id,
            commits: `${req.query.token === undefined ? response.data.length : response.data.find(p => p.id === parseInt(req.query.id)).statistics.commit_count}`,
            branch: response.data.find(p => p.id === parseInt(req.query.id)).default_branch,
            forks: response.data.find(p => p.id === parseInt(req.query.id)).forks_count,
            stars: response.data.find(p => p.id === parseInt(req.query.id)).star_count,
            wiki: `${response.data.find(p => p.id === parseInt(req.query.id)).wiki_enabled ? 'enabled' : 'no wiki'}`,
            topics: response.data.find(p => p.id === parseInt(req.query.id)).topics.length,
            lastCommit: date,
            repositorySize: `${req.query.token === undefined ? 'Cannot display this value, you need to specify access token in query string' : response.data.find(p => p.id === parseInt(req.query.id)).statistics.repository_size / 1000000 } MB`,
            storageSize: `${req.query.token === undefined ? 'Cannot display this value, you need to specify access token in query string' : response.data.find(p => p.id === parseInt(req.query.id)).statistics.storage_size / 1000000 } MB`,
            snippetsSize: `${req.query.token === undefined ? 'Cannot display this value, you need to specify access token in query string' : response.data.find(p => p.id === parseInt(req.query.id)).statistics.snippets_size / 1000000 } MB`,
            jobArtifacts: `${req.query.token === undefined ? 'Cannot display this value, you need to specify access token in query string' : response.data.find(p => p.id === parseInt(req.query.id)).statistics.job_artifacts_size / 1000000 } MB`,
            licence: `${req.query.licence === undefined ? 'Specify licence in url to use it' : req.query.licence}`
        }
        res.send(data)
    })
})

let PORT = process.env.PORT | 4001;

app.listen(PORT);
