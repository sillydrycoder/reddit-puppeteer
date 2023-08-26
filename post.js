
const puppeteer = require('puppeteer');

// Define a function to create a browser and a page with a proxy
async function createDriverWithProxy(proxyHost, proxyPort, proxyUsername, proxyPassword) {
    // Launch the browser with headless option
    const browser = await puppeteer.launch({
        headless: false, // or true if you want to hide the browser window
        args: [`--proxy-server=${proxyHost}:${proxyPort}`]
    });

    // Create a new page
    const page = await browser.newPage();
    
    // Configure proxy authentication
    page.authenticate({username: proxyUsername, password: proxyPassword})

    // Return the browser and the page objects
    return { browser, page };
}

// Define a function to perform the login process on Reddit
async function loginProcess(page, username, password) {
    // Go to the Reddit login page
    await Promise.all([
        page.goto('https://www.reddit.com/login'),
        page.waitForNavigation({timeout:60000})
    ])
    
    // Wait for the username field to appear and assign it to a variable
    const usernameField = await page.waitForSelector('#loginUsername');

    // Find the password field and the submit button by their selectors and assign them to variables
    const passwordField = await page.$('#loginPassword');
    const submitButton = await page.$('.AnimatedForm__submitButton.m-full-width');

    // Type the username and password into their respective fields
    await usernameField.type(username);
    await passwordField.type(password);

    await Promise.all([
        submitButton.click(), 
        page.waitForNavigation({timeout:120000})
    ]);

    // Return true after completing the login process
    return true;
}


async function agreeToCookies(page) {
    try {
        await page.waitForSelector('div[style*="opacity: 1; x: 1px; y: 0px; transform: translateY(0px) scale(1, 1);"]');
        const acceptButton = await page.$('button');
        await acceptButton.click();
    } catch (error) {
        console.log('No Cookies alert found.');
    }
}

async function createPostProcess(page ,subreddit, flair, title) {

    await Promise.all([
        page.goto(`https://www.reddit.com/r/${subreddit}/submit`),
        page.waitForNavigation({timeout:60000})
    ])
    await page.screenshot({ path: 'post.png' });
    // Handle cookies
    await agreeToCookies(page);
    // Add title to the textarea
    const titleBox = await page.$('textarea[style*="overflow-x: hidden; overflow-wrap: break-word; height: 39px;"]');
    await titleBox.type(title);
    
    const allButtons = await page.$$('button');
    if (flair) {
        const flairButton = allButtons[allButtons.length - 2];
        await flairButton.click();
        await page.waitForTimeout(3000)
        const flairDivs = await page.$$('div[aria-checked="false]');
        const generalFlair = flairButton[flairButton.length - 1]
        await generalFlair.click()
        const allButtons = await page.$$('button');
        const applyButton = allButtons[allButtons - 2]
        await applyButton.click()
        await page.waitForTimeout(3000)
    }
    
    // Click the post button
    const postButton = allButtons[allButtons.length - 5];
    await postButton.click();
}


// Define an async function to run the main logic
(async () => {
    // Define the proxy parameters as constants
    const PROXY_HOST = 'resi.ipv6.plainproxies.com';
    const PROXY_PORT = '8080';  // Changed to a string
    const PROXY_USERNAME = 'lucrumfansagencyftS';
    const PROXY_PASSWORD = 'product--resi6--pass--nnrYhBU9--country--UK--city--London--session--ovrstcfg--ttl--1s';

    // Create a driver with proxy using the function defined above
    const { browser, page } = await createDriverWithProxy(PROXY_HOST, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD);

    // Define the username and password for Reddit login as constants
    const USERNAME = 'Dry-Examination5696';
    const PASSWORD = 'hT*nCx_^E*';

    await page.goto("https://whatismyipaddress.com/")
    await page.waitForTimeout(15000)
    await page.screenshot({ path: 'proxy.png' });
    
    // Call the login process function with the page and the credentials
    await loginProcess(page, USERNAME, PASSWORD);
    await page.screenshot({ path: 'login.png' });
    
    await createPostProcess(page, 'freekarma4all', false, 'Hello')
    await page.waitForTimeout(15000) 
    await browser.close();
})();


