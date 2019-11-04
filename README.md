<h1>Mobile Chatting AutoBot(COMP90055 Computing Project) Submitted to Univeristy of Melbourne</h1>
<h3>Submitted by</h3>
<h4>Sahaj Dhingra 960448</h4> 
<h4>Hetal Shah 965690</h4> 
<h4>Shailee Swapnil 952247</h4>

<h3>Instructions to run</h3>
<h4>Mobile App</h4>

<b> Step 1:</b> Android App can be directly run on the mobile device by downloading the apk from the apk folder and running it on the android mobile device.<br>
<b> Step 2:</b> To compile the code on the system and run the android or ios app on the device, please clone the repository.<br>
<b> Step 3:</b> Install all the necessary packages on the system navigate to the client folder by doing <b>cd client</b> and then by running the command <b>npm install</b>. This will create a node_modules folder in the root directory.<br>
<b> Step 4:</b> Execute the command <b>expo start</b> to start the expo server on the system<br>
<b> Step 5:</b> To run the app on the mobile, install the Expo Client app from Play Store for android <a href="https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en">Click here to download Expo Client on android</a> or App Store for iOS <a href="https://apps.apple.com/au/app/expo-client/id982107779">Click here to download Expo Client on iOS</a><br>
<b> Step 6:</b> Open the expo client app on the phone and scan the QR code that was generated in step 4. This will compile the app and run it on your device.

<h4>Training the Model</h4>

<b> Step 1:</b> The pretrained model can be used. Its uploaded in the server folder for all 3 categories.<br>
<b>for Travel and Bookings</b> the file bookings_model.npz should be used<br>
<b>for Customer Support</b> the file support_model.npz should be used<br>
<b>for General</b> the file normal_model.npz should be used<br>
<b> Step 2:</b> The model can be trained by navigating to the training folder by executing the command <b>cd training/</b> and then installing all the necessary python packages by running the command <b>pip3 install -r requirements.txt</b><br>
<b> Step 3:</b> The model will start training by running the command <b>python3 main.py</b><br>
<b><i>PLEASE NOTE: THE MODEL SHOULD ONLY BE TRAINED ON A MACHINE WITH GPU FOR BEST PERFORMANCES. GOOGLE CLOUD PLATFORM GPU ENABLED MACHINE WAS USED FOR TRAINING OF THIS MODEL</i></b>


