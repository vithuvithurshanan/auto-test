import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import puppeteer from 'puppeteer';

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./devops_pipeline.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            status TEXT NOT NULL,
            date TEXT NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error("Error creating table", err);
                }
            });
    }
});

// Analyze Page Endpoint (Fetch DOM for AI)
app.post('/api/analyze-page', async (req, res) => {
    const { url } = req.body;
    let browser = null;
    try {
        console.log(`Analyzing page structure for: ${url}`);
        browser = await puppeteer.launch({
            headless: "new", // Headless for speed
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // Extract relevant DOM elements for AI context
        const pageContext = await page.evaluate(() => {
            // Helper to get robust identifier
            const getId = (el) => {
                if (el.id) return `#${el.id}`;
                if (el.name) return `[name="${el.name}"]`;
                if (el.className) return `.${el.className.split(' ').join('.')}`;
                return el.innerText ? `contains("${el.innerText.substring(0, 20)}")` : 'unknown';
            };

            const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
                tag: el.tagName.toLowerCase(),
                id: getId(el),
                type: el.type || 'text',
                placeholder: el.placeholder || ''
            }));

            const buttons = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"], div[role="button"]')).map(el => ({
                tag: el.tagName.toLowerCase(),
                id: getId(el),
                text: el.innerText || el.value || 'Submit'
            }));

            // Capture Navigation Links (Critical for "Go to X" workflows)
            const links = Array.from(document.querySelectorAll('a:not(.btn)')).filter(el => el.innerText.trim().length > 0).map(el => ({
                tag: 'a',
                id: getId(el),
                text: el.innerText.trim(),
                href: el.href
            })).slice(0, 50); // Limit to top 50 to avoid token overflow

            return {
                title: document.title,
                inputs,
                buttons,
                links,
                textSummary: document.body.innerText.substring(0, 1000).replace(/\s+/g, ' ')
            };
        });

        await browser.close();
        res.json(pageContext);

    } catch (error) {
        console.error("Page Analysis Failed:", error);
        if (browser) await browser.close();
        res.status(500).json({ error: "Failed to analyze page", details: error.message });
    }
});

// Real Browser Test Endpoint
app.post('/api/run-test', async (req, res) => {
    const { url, credentials, actions, testMode, selector } = req.body;
    let browser = null;
    let executionLogs = [];
    let errorDetected = false;

    try {
        console.log(`Launching real browser test for: ${url} [Mode: ${testMode}]`);

        // Launch browser
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log("Navigating...");
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        executionLogs.push("Navigated to initial URL");

        // --- INPUT BLOCKING SHIELD ---
        // Helper to inject/toggle shield using variable to avoid redefining
        const toggleShield = async (show) => {
            await page.evaluate((shouldShow) => {
                let shield = document.getElementById('ai-test-shield');
                if (!shield) {
                    shield = document.createElement('div');
                    shield.id = 'ai-test-shield';
                    shield.style.position = 'fixed';
                    shield.style.top = '0';
                    shield.style.left = '0';
                    shield.style.width = '100vw';
                    shield.style.height = '100vh';
                    shield.style.backgroundColor = 'rgba(255, 0, 0, 0.15)'; // Red tint
                    shield.style.zIndex = '2147483647';
                    shield.style.border = '10px solid red';
                    shield.style.display = 'flex';
                    shield.style.flexDirection = 'column';
                    shield.style.justifyContent = 'center';
                    shield.style.alignItems = 'center';
                    shield.style.pointerEvents = 'auto'; // Block clicks
                    shield.style.cursor = 'not-allowed';
                    shield.style.fontFamily = 'monospace';
                    shield.style.color = '#fff';
                    shield.style.fontWeight = 'bold';
                    shield.style.fontSize = '24px';
                    shield.style.textShadow = '2px 2px 4px #000';

                    const icon = document.createElement('div');
                    icon.innerText = '🚫';
                    icon.style.fontSize = '64px';
                    icon.style.marginBottom = '20px';

                    const text = document.createElement('div');
                    text.innerText = 'AUTHENTICATED AUTOMATION RUNNING';

                    const sub = document.createElement('div');
                    sub.innerText = 'Do not touch mouse or keyboard';
                    sub.style.fontSize = '16px';
                    sub.style.marginTop = '10px';

                    shield.appendChild(icon);
                    shield.appendChild(text);
                    shield.appendChild(sub);
                    document.body.appendChild(shield);
                }
                shield.style.display = shouldShow ? 'flex' : 'none';
            }, show);
        };

        // Activate Shield Immediately
        await toggleShield(true);
        executionLogs.push("User input disabled (Shield Active)");

        // --- HANDLE GOOGLE/COMMON COOKIE CONSENT STUFF ---
        try {
            await toggleShield(false); // Disable to click
            const consentSelectors = [
                'button[id="L2AGLb"]', // Google "Accept all"
                'div[role="button"][innerHTML*="Accept"]',
                'button:contains("Accept all")'
            ];
            for (const sel of consentSelectors) {
                if (await page.$(sel)) {
                    await page.click(sel);
                    executionLogs.push("Clicked cookie consent button");
                    await new Promise(r => setTimeout(r, 1000));
                    break;
                }
            }
            await toggleShield(true); // Re-enable
        } catch (e) {
            await toggleShield(true);
        }

        // --- AUTHENTICATION LOGIC ---
        if (credentials && credentials.username && credentials.password) {
            console.log("Attempting authentication...");
            executionLogs.push("Attempting authentication...");

            await toggleShield(false); // Allow interaction

            const userSelectors = ['input[type="email"]', 'input[name="email"]', 'input[name="username"]', 'input[type="text"]', '#username', '#email'];
            let userField = null;
            for (const selector of userSelectors) {
                userField = await page.$(selector);
                if (userField) break;
            }

            const passSelectors = ['input[type="password"]', 'input[name="password"]', '#password'];
            let passField = null;
            for (const selector of passSelectors) {
                passField = await page.$(selector);
                if (passField) break;
            }

            if (userField && passField) {
                await userField.click();
                await userField.type(credentials.username, { delay: 50 });
                await passField.click();
                await passField.type(credentials.password, { delay: 50 });

                const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:not([type])'];
                let submitBtn = null;
                for (const selector of submitSelectors) {
                    submitBtn = await page.$(selector);
                    if (submitBtn) break;
                }

                if (submitBtn) {
                    await Promise.all([
                        submitBtn.click(),
                        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log("Navigation timeout (might be SPA)"))
                    ]);
                } else {
                    await page.keyboard.press('Enter');
                    await new Promise(r => setTimeout(r, 3000));
                }
                executionLogs.push("Authentication sequence completed");
            } else {
                executionLogs.push("WARNING: Could not find login fields automatically.");
            }
            // Re-enable shield on new page
            await toggleShield(true);
        }

        // --- DYNAMIC ACTIONS EXECUTION ---
        if (actions && Array.isArray(actions)) {
            console.log(`Executing ${actions.length} workflow actions...`);
            executionLogs.push(`Executing ${actions.length} defined workflow steps`);

            for (const step of actions) {
                try {
                    console.log(`Action: ${step.action} on ${step.selector || 'page'}`);
                    executionLogs.push(`Step: ${step.description || step.action}`);

                    await toggleShield(false); // Unblock for Action

                    if (step.action === 'type' && step.selector) {
                        try {
                            // Try primary selector
                            await page.waitForSelector(step.selector, { timeout: 3000 });
                            await page.type(step.selector, step.value, { delay: 50 });
                        } catch (e) {
                            console.log(`Primary selector ${step.selector} failed, trying fallbacks...`);
                            // FALLBACKS for common search inputs
                            const fallbacks = ['textarea[name="q"]', 'input[name="q"]', '[title="Search"]', 'input[type="search"]'];
                            let found = false;
                            for (const fb of fallbacks) {
                                if (await page.$(fb)) {
                                    await page.type(fb, step.value, { delay: 50 });
                                    found = true;
                                    executionLogs.push(`Used fallback selector: ${fb}`);
                                    break;
                                }
                            }
                            if (!found) {
                                executionLogs.push(`FAILED: Could not find element ${step.selector} (or fallbacks) to type in.`);
                                errorDetected = true;
                            }
                        }
                    } else if (step.action === 'click' && step.selector) {
                        try {
                            await page.waitForSelector(step.selector, { timeout: 5000 });
                            await page.click(step.selector);
                            // Wait a bit for UI reaction
                            await new Promise(r => setTimeout(r, 1000));
                        } catch (e) {
                            console.log(`Preferred selector ${step.selector} failed. Trying text match fallback...`);

                            // fallback: Try to click by text content (XPath)
                            try {
                                const cleanText = step.selector.replace(/['"\[\]]/g, ''); // Naive cleanup if selector was text
                                const xpath = `//*[contains(text(), '${step.value || cleanText}')]`;
                                const elements = await page.$x(xpath);
                                if (elements.length > 0) {
                                    await elements[0].click();
                                    executionLogs.push(`Fallback: Clicked element by text "${step.value || cleanText}"`);
                                    found = true;
                                    await new Promise(r => setTimeout(r, 1000));
                                } else {
                                    throw new Error("Text fallback failed");
                                }
                            } catch (fallbackErr) {
                                executionLogs.push(`FAILED: Could not click element ${step.selector}.`);
                                errorDetected = true;
                            }
                        }
                    } else if (step.action === 'submit' && step.selector) {
                        await page.click(step.selector);
                        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => { });
                    } else if (step.action === 'wait') {
                        await new Promise(r => setTimeout(r, 2000));
                    } else if (step.action === 'press_key') {
                        await page.keyboard.press(step.value);
                        await new Promise(r => setTimeout(r, 1000));
                    } else if (step.action === 'check_text') {
                        const content = await page.content();
                        if (!content.includes(step.value)) {
                            executionLogs.push(`FAILED: Text "${step.value}" not found on page.`);
                            errorDetected = true;
                        } else {
                            executionLogs.push(`SUCCESS: Text "${step.value}" found.`);
                        }
                    }

                    await toggleShield(true); // Re-block

                    // --- VALIDATION CHECK AFTER EACH STEP ---
                    // Look for common error messages
                    const errorText = await page.evaluate(() => {
                        const errorSelectors = ['.error', '.text-danger', '.alert-danger', '.invalid-feedback'];
                        for (let s of errorSelectors) {
                            const el = document.querySelector(s);
                            if (el && el.innerText.trim().length > 0 && el.offsetHeight > 0) return el.innerText;
                        }
                        // Also check for "required" or "invalid" text in visible body
                        if (document.body.innerText.toLowerCase().includes("field is required")) return "Field is required error found";
                        return null;
                    });

                    if (errorText) {
                        executionLogs.push(`VALIDATION ERROR DETECTED: "${errorText}"`);
                        console.log(`Validation Error: ${errorText}`);
                        errorDetected = true;
                    }

                } catch (actionErr) {
                    console.error("Step execution failed:", actionErr);
                    executionLogs.push(`ERROR executing step: ${actionErr.message}`);
                }
            }
        }

        // --- UNIT TEST MODE VISUALIZATION ---
        if (testMode === 'unit' && selector) {
            executionLogs.push(`UNIT TEST MODE: Focusing on element ${selector}`);
            try {
                await page.waitForSelector(selector, { timeout: 5000 });

                // Highlight the element visually
                await page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    if (el) {
                        el.style.border = '5px solid red';
                        el.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.7)';
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, selector);

                // Wait for user to see it
                await new Promise(r => setTimeout(r, 5000));
                executionLogs.push(`SUCCESS: Element ${selector} isolated and verified.`);
            } catch (e) {
                executionLogs.push(`UNIT TEST FAILED: Could not isolate element ${selector}`);
                errorDetected = true;
            }
        }

        const title = await page.title();
        const metrics = await page.metrics();

        await new Promise(r => setTimeout(r, 3000));
        await browser.close();

        res.json({
            message: "Test executed",
            data: {
                title,
                nodes: metrics.Nodes,
                layoutDuration: metrics.LayoutDuration,
                logs: executionLogs,
                errorDetected
            }
        });

    } catch (error) {
        console.error("Puppeteer Test Failed:", error);
        if (browser) await browser.close();

        res.status(500).json({
            error: "Browser Test Failed",
            details: error.message,
            logs: executionLogs
        });
    }
});

app.get('/api/history', (req, res) => {
    db.all("SELECT * FROM history ORDER BY rowid DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/history', (req, res) => {
    const { id, url, status, date } = req.body;
    const sql = 'INSERT INTO history (id, url, status, date) VALUES (?,?,?,?)';
    const params = [id, url, status, date];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message })
            return;
        }
        res.json({
            "message": "success",
            "data": req.body
        })
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
