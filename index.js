const express = require('express');
const axios = require('axios');

const app = express();

app.get('/badge', async (req, res) => {
    let username = req.query.username;
   
    axios.get(`https://gitlab.com/api/v4/users/${username}/projects?statistics=true${`${req.query.token !== undefined ? `&access_token=${req.query.token}` : ''}`}`)
    .then(response => {
        let data = {
            projectId: response.data.find(p => p.id === parseInt(req.query.id)).id,
            commits: `${req.query.token === undefined ? response.data.length : response.data.find(p => p.id === parseInt(req.query.id)).statistics.commit_count}`,
            branch: response.data.find(p => p.id === parseInt(req.query.id)).default_branch,
            forks: response.data.find(p => p.id === parseInt(req.query.id)).forks_count,
            stars: response.data.find(p => p.id === parseInt(req.query.id)).star_count,
            wiki: `${response.data.find(p => p.id === parseInt(req.query.id)).wiki_enabled ? 'enabled' : 'no wiki'}`,
            tags: response.data.find(p => p.id === parseInt(req.query.id)).tag_list.length,
            topics: response.data.find(p => p.id === parseInt(req.query.id)).topics.length,
            lastCommit: `${new Date(response.data.find(p => p.id === parseInt(req.query.id)).last_activity_at).getDate() < 10 ? `0${new Date(response.data.find(p => p.id === parseInt(req.query.id)).last_activity_at).getDate()}` : new Date(response.data.find(p => p.id === parseInt(req.query.id)).last_activity_at).getDate()} / ${new Date(response.data.find(p => p.id === parseInt(req.query.id)).last_activity_at).getMonth()} / ${new Date(response.data.find(p => p.id === parseInt(req.query.id)).last_activity_at).getFullYear()}`,
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
