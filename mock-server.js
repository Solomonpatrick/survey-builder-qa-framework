const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// In-memory store for surveys and responses
const db = {
    surveys: [],
    nextSurveyId: 1
};

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    console.log(`${method} ${pathname}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    // API endpoints
    if (pathname === '/api/surveys' && method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(db.surveys));
        return;
    }
    
    if (pathname === '/api/surveys' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const survey = JSON.parse(body);
                const newSurvey = {
                    id: db.nextSurveyId++,
                    title: survey.title,
                    questions: survey.questions || [],
                    createdAt: new Date().toISOString(),
                    responses: []
                };
                
                db.surveys.push(newSurvey);
                
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 201;
                res.end(JSON.stringify(newSurvey));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        });
        
        return;
    }
    
    // GET surveys/:id/responses
    if (pathname.match(/^\/api\/surveys\/\d+\/responses$/) && method === 'GET') {
        const surveyId = parseInt(pathname.split('/')[3]);
        const survey = db.surveys.find(s => s.id === surveyId);
        
        if (!survey) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Survey not found' }));
            return;
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(survey.responses));
        return;
    }
    
    // POST surveys/:id/responses
    if (pathname.match(/^\/api\/surveys\/\d+\/responses$/) && method === 'POST') {
        const surveyId = parseInt(pathname.split('/')[3]);
        const survey = db.surveys.find(s => s.id === surveyId);
        
        if (!survey) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Survey not found' }));
            return;
        }
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const responseData = JSON.parse(body);
                const newResponse = {
                    id: survey.responses.length + 1,
                    submittedAt: new Date().toISOString(),
                    responses: responseData.responses || []
                };
                
                survey.responses.push(newResponse);
                
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 201;
                res.end(JSON.stringify(newResponse));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        });
        
        return;
    }
    
    // DELETE survey/:id
    if (pathname.match(/^\/api\/surveys\/\d+$/) && method === 'DELETE') {
        const surveyId = parseInt(pathname.split('/')[3]);
        const surveyIndex = db.surveys.findIndex(s => s.id === surveyId);
        
        if (surveyIndex === -1) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Survey not found' }));
            return;
        }
        
        db.surveys.splice(surveyIndex, 1);
        
        res.statusCode = 204;
        res.end();
        return;
    }
    
    // Serve static files
    if (method === 'GET') {
        let filePath = '';
        
        if (pathname === '/' || pathname === '/index.html') {
            filePath = path.join(__dirname, 'public', 'index.html');
        } else {
            filePath = path.join(__dirname, 'public', pathname);
        }
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                // If the file is not found, serve index.html for SPA routing
                if (err.code === 'ENOENT') {
                    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
                        if (err) {
                            res.statusCode = 500;
                            res.end('Error loading index.html');
                        } else {
                            res.setHeader('Content-Type', 'text/html');
                            res.end(data);
                        }
                    });
                } else {
                    res.statusCode = 500;
                    res.end('Internal server error');
                }
                return;
            }
            
            // Set content type based on file extension
            const ext = path.extname(filePath);
            let contentType = 'text/html';
            
            switch (ext) {
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                    contentType = 'image/jpg';
                    break;
            }
            
            res.setHeader('Content-Type', contentType);
            res.end(data);
        });
    } else {
        res.statusCode = 404;
        res.end('Not found');
    }
});

// Create a demo survey on server start
function createDemoSurvey() {
    const demoSurvey = {
        title: "Test Survey",
        questions: [
            {
                type: "multiple-choice",
                title: "What is your favorite color?",
                options: ["Red", "Blue", "Green"]
            }
        ]
    };
    
    const newSurvey = {
        id: db.nextSurveyId++,
        title: demoSurvey.title,
        questions: demoSurvey.questions,
        createdAt: new Date().toISOString(),
        responses: []
    };
    
    db.surveys.push(newSurvey);
    console.log("Demo survey created:", newSurvey);
}

// Start the server
const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    createDemoSurvey();
});