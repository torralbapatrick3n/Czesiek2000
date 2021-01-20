const express = require('express');
const axios = require('axios');
const path = require('path');

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

async function getUsers(id, token) {
    const res = await axios.get(`https://gitlab.com/api/v4/projects/${id}/users?access_token=${token}`)
    const json = await res.data;
    return json;
}

async function commits(id, token) {
    const response = await axios.get(`https://gitlab.com/api/v4/projects/${id}/repository/commits?per_page=100&access_token=${token}`)
    const json = await response.data.reduce(j => j);
    return json;
}

async function getPipelines(id, token) {
    return axios.get(`https://gitlab.com/api/v4/projects/${id}/pipelines?per_page=100&access_token=${token}`)
    .then(response => response.data);
}

app.get('/', (req, res) => {
    res.send('<h1>Go to /badge to get badge informations </h1>');
});

app.get('/badge', async (req, res) => {
    let username = req.query.username;
    let id = req.query.id;
    let token = req.query.token;
    

    axios.get(`https://gitlab.com/api/v4/users/${username}/projects?statistics=true${`${req.query.token !== undefined ? `&access_token=${req.query.token}` : ''}`}&per_page=100`)
    .then(response => {
        let project = response.data.filter(p => p.id == req.query.id);
        
        if (response.data.length === 0) {
            res.send('<h1>User not found</h1>');
        }else {
            if(response.data.find(p => p.id === parseInt(req.query.id)) === undefined) {
                return res.send('<h1>Project not found</h1>');
            }
            project = project.reduce(j => j);
            let date = formatDate(new Date(response.data.find(p => p.id === parseInt(req.query.id)).last_activity_at), parseInt(req.query.format));

            getUsers(project.id, req.query.token).then(u => {
                commits(project.id, req.query.token).then(c => {
                    axios.get(`https://gitlab.com/api/v4/projects/${project.id}/pipelines?access_token=${req.query.token}`)
                    .then(p => {
                        let data = {
                            id: project.id,
                            shortId: c.short_id,
                            commitCount: c.commits,
                            branch: project.default_branch,
                            stars: project.star_count,
                            topics: project.topics.length,
                            forks: project.forks_count,
                            wiki: project.wiki_enabled ? 'Enabled' : 'No wiki',
                            lastCommit: date,
                            createdAt: formatDate(new Date(response.data.find(p => p.id === parseInt(req.query.id)).created_at), parseInt(req.query.format)),
                            repositorySize: `${req.query.token === undefined ? 'No authorize cannot display this value, you need to specify access token in query string' : (response.data.find(p => p.id === parseInt(req.query.id)).statistics.repository_size / 1000000).toFixed(2) } MB`,
                            storageSize: `${req.query.token === undefined ? 'No authorize cannot display this value, you need to specify access token in query string' : (response.data.find(p => p.id === parseInt(req.query.id)).statistics.storage_size / 1000000).toFixed(2) } MB`,
                            snippetsSize: `${req.query.token === undefined ? 'No authorize cannot display this value, you need to specify access token in query string' : (response.data.find(p => p.id === parseInt(req.query.id)).statistics.snippets_size / 1000000).toFixed(2) } MB`,
                            jobArtifacts: `${req.query.token === undefined ? 'No authorize cannot display this value, you need to specify access token in query string' : (response.data.find(p => p.id === parseInt(req.query.id)).statistics.job_artifacts_size / 1000000).toFixed(2) } MB`,
                            totalPipelines: p.data.length,
                            latestPipelineStatus: p.data.reduce(j => j).status,
                            contributors: u.length,
                            repositoryUrl: project.http_url_to_repo,
                            version: req.query.licence,
                        }
                        res.send(data);
                    })
                })
            })
            
        }
    })
    // .catch(error => {
    //     res.send({ error: error.response.status, message: 'User or project not found' });
    // });
})

app.get('/generate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
    
const port = process.env.PORT || 4001;

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
