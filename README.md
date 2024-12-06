# CORDY

## **Cordy** is a web application written in Typescript/Javascript that leverages the browsers capabilities to record videos.

## Functioning

As soon as you open the app, meaning you're at the root of the application, you'll be served with a page that displays a card with a lightblue space and some buttons around.

On the bottom of the card, you have like 5 buttons. Clik on the third one, the one in the middle.
The video will start recording. To stop the recording click on the same button. And **in case you want to pause-resume the video**, just click on the fourth button. It's the same button for both pausing and resuming the video. **In case you want to completely cancel the video you'd have been recording**, just click the second button and everything will be gone.

Now, you've just stopped the recording by clicking on the same button you clicked on to start. What happens is : first the video gets directly added to you page so you can view it and then it gets saved to a local database on your apparatus.

The newly added element (the video to view) will contain a few interesting things : first of all, on the bottom left corner of the video preview card, you'll have a **small circle in red** to mean that the video is **not uploaded to the server yet**. That's how you know wether the video you're currently viewing is on your apparatus or on the server. Then you'll have a text to display the size of the video in megabytes along with a couple of buttons :

- The **trash** one to delete it from your local database (so it will be permanently deleted).
- The **upload** one to upload your video to the server.

If you click on the upload button, the video will be sent to a server which will take care of saving it somewhere (in the clouds, lol). As soon as the server has saved your video, the previewing card will change its aspect.

The red circle will turn **lightgreen** and the _upload_ button will be replaced by a **download** one. And still, in case you want to delete your video from the cloud, you can click on the trash.

## Technologies

- Typescript
- Javascript
- Express
- Cloudinary

## Note

I wrote an API around the web MediaStream and MediaRecorder apis to make the app work as it does. If you need the code, visit [this file]("C:\Users\USER\Desktop\codebase\cordy\src\libs\api.ts").

## Gotchas

As the app is hosted by Netlify, videos can not be uploaded to a server because Netlify is, apparently, serverless. And when I tried to host on Render (a Web Service) I got an error because of the blobs. They were not valid ( see issues ). So the solutions are either to directly send the blobs to the server withour first storing them into a local database, and store them in cloudinary to get a URL that's securely accessible (this solution applies for Render) or create server functions (this solution applies for Netlify).

#### This code is open source. You can use it however you want and help improve it. Just create a branch with your name and make sure to update the README file to explain the changes you made and how the app would work after them. 
