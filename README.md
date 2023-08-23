# Airbnb - Automatic Confirmation Email Sending

## About

This code enables the automation of sending confirmation emails for the flat we rent through the Airbnb platform. It identifies the next guest, collects some information, and sends the release email.

## Technologies Used

1. Node.js (18.16.0) com nvm

   Used as the programming language for building the project.

2. MongoDB

   Our primary database, using the free version due to the limited number of guests in our single Airbnb flat.

3. Prisma
   
   The ORM used to facilitate integration with the MongoDB database.
   
4. MSSQL Server0
   
   Used to query CPFs from a private provider.
   
5. Open AI API
    
   To extract dates, cars, names, and documents. I chose to use OpenAI to avoid manual work, but I plan to remove this feature in the future.
   
6. Sendgrid
    
   For sending emails.

## To Implement as a Service

In the repository, I have also included a systemd service configuration file, should you wish to implement this on a Linux server. 

Please be aware that Airbnb blocks IP addresses from Digital Ocean servers to prevent scraping. 

It's also worth noting that Airbnb may block other cloud server providers as well. 

The application in question is running on a local Ubuntu 22.04 server at my home, thus avoiding these restrictions

- Save the `airbnbd.service` file to `/etc/systemd/system/airbnbd.service`.
- Replace the path `/path/to/files/airbnb` with the path where the repository files are located.

- Execute to start:

```
systemctl start airbnbd
```

- To enable the service:

```
systemctl enable airbnbd
```

- If you want to monitor:

```
watch systemctl status airbnbd
```

### Prerequisites

It is necessary for the user to have Node.js installed on their machine to proceed with the following instructions.

```
npm install
```

Furthermore, it is necessary to set the environment variables present in .env to work properly.

### Running

```
npm run dev
```

Now all you have to do is wait until it finishes. You can go grab a cup of coffee.
