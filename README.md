# Node.js HBS DigitalOcean Server Controller 

This Node.js application allows you to control your DigitalOcean server and automatically turn it off after a certain time. It uses the HBS (Handlebars) template engine for rendering HTML views and Socket.IO for real-time communication between the server and client.

## Prerequisites

Before running the application, make sure you have the following:

- Node.js installed on your machine.
- DigitalOcean API token.
- Droplet ID of the server you want to control.
- (Optional) A cancel password to stop the timer manually.

## Installation

1. Clone this repository to your local machine or download the source code.

2. Install the dependencies by running the following command:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory of the project and add the following environment variables:

   ```
   PORT=3000
   DEFAULT_DROPLET_ID=YOUR_DROPLET_ID
   DIGITALOCEAN_TOKEN=YOUR_DIGITALOCEAN_API_TOKEN
   CANCEL_PASSWORD=YOUR_CANCEL_PASSWORD
   ```

   Replace `YOUR_DROPLET_ID` with the ID of your DigitalOcean server, `YOUR_DIGITALOCEAN_API_TOKEN` with your DigitalOcean API token, and `YOUR_CANCEL_PASSWORD` with your desired cancel password.

## Usage

1. Start the application by running the following command:

   ```bash
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:3000`.

3. Enter the Droplet ID of your server in the input field and click "Submit".

4. The current status of your server will be displayed along with the remaining time before it automatically turns off.

5. To turn on the server and start the timer, click the "Turn On Server" button and specify the desired timer duration in hours.

6. The server status and remaining time will be updated in real-time. You can increase or decrease the remaining time by 15 minutes using the respective buttons.

7. If you want to manually turn off the server before the timer expires, click the "Turn Off Server Now" button.

8. To cancel the timer and stop the server from turning off automatically, enter the cancel password and click the "Cancel Timer" button.

## Customization

You can customize the application according to your needs:

- Modify the HTML templates in the `views` directory to change the appearance of the web pages.
- Customize the CSS styles in the `<style>` section of the HTML template or by linking an external CSS file.
- Adjust the timer interval or add additional functionality in the Node.js server code (`index.js` file).

## License

This project is licensed under the MIT License. Feel free to use and modify it according to your needs.

## Acknowledgements

This application uses the following dependencies:

- Express.js: https://expressjs.com/
- Handlebars.js: https://handlebarsjs.com/
- Socket.IO: https://socket.io/
- Axios: https://axios-http.com/
- Bootstrap: https://getbootstrap.com/