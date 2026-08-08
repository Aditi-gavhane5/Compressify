/* =========================================================
   COMPRESSIFY - IMAGE COMPRESSOR
   JAVASCRIPT
   ========================================================= */


/* =========================================================
   1. FIND HTML ELEMENTS
   ========================================================= */

/*
    document.querySelector() searches our HTML page
    and finds an element using its class or ID.

    Example:

    "#imageInput"
        → finds id="imageInput"

    ".choose-button"
        → finds class="choose-button"
*/


// ---------------- IMAGE UPLOAD ----------------

// Find the visible "Choose Image" button.
const chooseButton =
    document.querySelector(".choose-button");

// Find the hidden file input.
const imageInput =
    document.querySelector("#imageInput");

// Find the upload box.
const uploadBox =
    document.querySelector(".upload-box");



// ---------------- COMPRESSION MODES ----------------

// Find Quality Mode radio button.
const qualityMode =
    document.querySelector("#qualityMode");

// Find Target File Size Mode radio button.
const targetSizeMode =
    document.querySelector("#targetSizeMode");



// ---------------- QUALITY SETTINGS ----------------

// Find the quality settings section.
const qualitySettings =
    document.querySelector("#qualitySettings");

// Find the quality slider.
const qualitySlider =
    document.querySelector("#qualitySlider");

// Find the number displaying the quality.
const qualityValue =
    document.querySelector("#qualityValue");



// ---------------- TARGET SIZE SETTINGS ----------------

// Find the target size section.
const targetSizeSettings =
    document.querySelector("#targetSizeSettings");

// Find target size input.
const targetSizeInput =
    document.querySelector("#targetSize");

// Find KB/MB dropdown.
const targetUnit =
    document.querySelector("#targetUnit");

// Find quick target section.
const quickTargets =
    document.querySelector("#quickTargets");

// Find all quick target buttons.
const targetPresetButtons =
    document.querySelectorAll(".target-preset");



// ---------------- OUTPUT FORMAT ----------------

// Find the output format dropdown.
//
// This dropdown now contains:
//
// WEBP
// JPG
// PNG
// JPEG
// GIF
// BMP
//
const formatSelect =
    document.querySelector("#formatSelect");



// ---------------- COMPRESSION BUTTON ----------------

// Find Compress Image button.
const compressButton =
    document.querySelector("#compressButton");



// ---------------- RESULT SECTION ----------------

// Find compression result box.
const compressionResult =
    document.querySelector("#compressionResult");

// Find original file size text.
const originalSize =
    document.querySelector("#originalSize");

// Find compressed file size text.
const compressedSize =
    document.querySelector("#compressedSize");

// Find Download button.
const downloadButton =
    document.querySelector("#downloadButton");



/* =========================================================
   2. VARIABLES
   ========================================================= */

/*
    selectedImage stores the image chosen by the user.

    At the beginning there is no image.

    Therefore:

        selectedImage = null
*/

let selectedImage = null;



/*
    This variable will store the temporary browser URL
    of the compressed image returned by Python.

    The Download button will use this URL.
*/

let compressedImageURL = null;



/*
    We store the original HTML inside the upload box.

    Why?

    When the user selects an image, JavaScript replaces
    the upload box with an image preview.

    If the user clicks "Remove Image", we restore
    the original upload interface.
*/

const originalUploadHTML =
    uploadBox.innerHTML;



/* =========================================================
   3. CHOOSE IMAGE BUTTON
   ========================================================= */

/*
    Our real file input is hidden.

    When the user clicks the beautiful
    "Choose Image" button, JavaScript opens
    the hidden file picker.
*/

chooseButton.addEventListener(
    "click",
    function () {

        // Open the computer's file picker.
        imageInput.click();

    }
);



/* =========================================================
   4. IMAGE FILE SELECTED
   ========================================================= */

/*
    The "change" event runs when the user
    selects a file from their computer.
*/

imageInput.addEventListener(
    "change",
    function () {

        // Get the first selected file.
        const file =
            imageInput.files[0];


        // If the user didn't select anything, stop.
        if (!file) {
            return;
        }


        // Process the selected image.
        handleImage(file);

    }
);



/* =========================================================
   5. HANDLE SELECTED IMAGE
   ========================================================= */

/*
    This function:

    1. Stores the image
    2. Checks whether it is an image
    3. Checks the maximum file size
    4. Displays the image preview
*/

function handleImage(file) {


    /* -----------------------------------------------------
       STORE IMAGE
       ----------------------------------------------------- */

    selectedImage = file;



    /* -----------------------------------------------------
       CHECK FILE TYPE
       ----------------------------------------------------- */

    /*
        The browser gives us the file type.

        Examples:

        image/jpeg
        image/png
        image/webp
        image/gif
        image/bmp
    */

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image file."
        );

        selectedImage = null;

        return;
    }



    /* -----------------------------------------------------
       CHECK FILE SIZE
       ----------------------------------------------------- */

    /*
        JavaScript gives file size in BYTES.

        10 MB is:

        10 × 1024 × 1024
    */

    const maximumSize =
        10 * 1024 * 1024;


    if (file.size > maximumSize) {

        alert(
            "Image size must be less than 10 MB."
        );

        selectedImage = null;

        return;
    }



    /* -----------------------------------------------------
       SHOW IMAGE PREVIEW
       ----------------------------------------------------- */

    displayImagePreview(file);

}



/* =========================================================
   6. DISPLAY IMAGE PREVIEW
   ========================================================= */

/*
    FileReader allows the browser to read the
    selected image and display it.

    IMPORTANT:

    At this point the image has NOT been sent
    to Python yet.

    Python receives it only when the user clicks
    "Compress Image".
*/

function displayImagePreview(file) {


    // Create a FileReader.
    const reader =
        new FileReader();


    /*
        onload runs after the browser has
        finished reading the image.
    */

    reader.onload =
        function (event) {


            // Get the image data.
            const imageURL =
                event.target.result;


            // Create an image element.
            const image =
                document.createElement("img");


            // Put the selected image into it.
            image.src =
                imageURL;


            // Accessibility description.
            image.alt =
                "Selected image";


            /*
                Temporary preview styling.

                Our main design styling is in CSS,
                but these make sure the preview
                doesn't become enormous.
            */

            image.style.maxWidth =
                "400px";

            image.style.maxHeight =
                "280px";

            image.style.objectFit =
                "contain";

            image.style.borderRadius =
                "16px";



            /* -------------------------------------------------
               GET IMAGE DIMENSIONS
               ------------------------------------------------- */

            image.onload =
                function () {


                    const width =
                        image.naturalWidth;

                    const height =
                        image.naturalHeight;


                    // Convert bytes into KB/MB.
                    const fileSize =
                        formatFileSize(
                            file.size
                        );



                    /* -----------------------------------------
                       REPLACE UPLOAD BOX CONTENT
                       ----------------------------------------- */

                    uploadBox.innerHTML = `

                        <h3 style="margin-bottom: 20px;">
                            Image Selected
                        </h3>

                    `;


                    // Add image preview.
                    uploadBox.appendChild(
                        image
                    );



                    /* -----------------------------------------
                       IMAGE INFORMATION
                       ----------------------------------------- */

                    const imageInfo =
                        document.createElement("div");


                    imageInfo.innerHTML = `

                        <p>
                            <strong>File:</strong>
                            ${file.name}
                        </p>

                        <p>
                            <strong>Size:</strong>
                            ${fileSize}
                        </p>

                        <p>
                            <strong>Dimensions:</strong>
                            ${width} × ${height}px
                        </p>

                    `;


                    uploadBox.appendChild(
                        imageInfo
                    );



                    /* -----------------------------------------
                       REMOVE IMAGE BUTTON
                       ----------------------------------------- */

                    const removeButton =
                        document.createElement("button");


                    removeButton.textContent =
                        "Remove Image";


                    removeButton.className =
                        "remove-image-button";


                    uploadBox.appendChild(
                        removeButton
                    );


                    /*
                        Clicking Remove Image
                        returns the upload box
                        to its original state.
                    */

                    removeButton.addEventListener(
                        "click",
                        function () {

                            resetUploadBox();

                        }
                    );

                };


        };


    // Read the image.
    reader.readAsDataURL(file);

}



/* =========================================================
   7. FORMAT FILE SIZE
   ========================================================= */

/*
    Files are measured in bytes by JavaScript.

    This function converts them into something
    easier for humans to read.

    Example:

        1300000 bytes

             ↓

        1.24 MB
*/

function formatFileSize(bytes) {


    // If the file is empty.
    if (bytes === 0) {

        return "0 Bytes";

    }


    // Units available.
    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    /*
        Calculate which unit should be used.
    */

    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    // Convert bytes to the selected unit.
    const size =
        bytes /
        Math.pow(1024, index);


    // Return a readable value.
    return (
        size.toFixed(2)
        + " "
        + units[index]
    );

}



/* =========================================================
   8. RESET UPLOAD BOX
   ========================================================= */

/*
    This function restores the upload box
    after the user removes their image.
*/

function resetUploadBox() {


    // Remove the selected image.
    selectedImage = null;


    // Clear the file input.
    imageInput.value = "";


    // Restore original HTML.
    uploadBox.innerHTML =
        originalUploadHTML;


    /*
        Because we replaced the upload box HTML,
        the original Choose Image button was
        also replaced.

        Therefore we need to find the new button
        and connect it again.
    */

    const newChooseButton =
        uploadBox.querySelector(
            ".choose-button"
        );


    newChooseButton.addEventListener(
        "click",
        function () {

            imageInput.click();

        }
    );

}



/* =========================================================
   9. DRAG AND DROP
   ========================================================= */

/*
    These events allow the user to drag an image
    directly into the upload box.
*/


/* ---------------- DRAG OVER ---------------- */

uploadBox.addEventListener(
    "dragover",
    function (event) {


        /*
            Prevent the browser from opening
            the image automatically.
        */

        event.preventDefault();


        // Highlight the upload box.
        uploadBox.style.borderColor =
            "#6557d8";

    }
);



/* ---------------- DRAG LEAVE ---------------- */

uploadBox.addEventListener(
    "dragleave",
    function () {


        // Return the border to normal.
        uploadBox.style.borderColor =
            "#d9d4ed";

    }
);



/* ---------------- DROP ---------------- */

uploadBox.addEventListener(
    "drop",
    function (event) {


        // Prevent normal browser behaviour.
        event.preventDefault();


        // Return border to normal.
        uploadBox.style.borderColor =
            "#d9d4ed";


        // Get the dropped file.
        const file =
            event.dataTransfer.files[0];


        // Process the file if one exists.
        if (file) {

            handleImage(file);

        }

    }
);



/* =========================================================
   10. COMPRESSION MODE SWITCHING
   ========================================================= */

/*
    We have TWO compression modes:

        1. Quality
        2. Target File Size

    Quality Mode:

        Show quality slider.
        Hide target size controls.

    Target Size Mode:

        Hide quality slider.
        Show target size controls.
*/


qualityMode.addEventListener(
    "change",
    function () {


        // Show Quality settings.
        qualitySettings.style.display =
            "flex";


        // Hide Target Size settings.
        targetSizeSettings.style.display =
            "none";


        // Hide quick target buttons.
        quickTargets.style.display =
            "none";

    }
);



targetSizeMode.addEventListener(
    "change",
    function () {


        // Hide Quality settings.
        qualitySettings.style.display =
            "none";


        // Show Target Size settings.
        targetSizeSettings.style.display =
            "flex";


        // Show quick target buttons.
        quickTargets.style.display =
            "flex";

    }
);



/* =========================================================
   11. QUALITY SLIDER
   ========================================================= */

/*
    Whenever the slider moves,
    update the percentage shown beside it.
*/

qualitySlider.addEventListener(
    "input",
    function () {


        // Get current slider value.
        const quality =
            qualitySlider.value;


        // Display it.
        qualityValue.textContent =
            quality + "%";

    }
);



/* =========================================================
   12. QUICK TARGET BUTTONS
   ========================================================= */

/*
    Our preset buttons are:

        50 KB
        100 KB
        200 KB
        500 KB

    Clicking one automatically fills
    the Target File Size box.
*/

targetPresetButtons.forEach(
    function (button) {


        button.addEventListener(
            "click",
            function () {


                /*
                    data-size comes from HTML.

                    Example:

                    data-size="100"

                    gives:

                    100
                */

                const selectedSize =
                    button.dataset.size;


                // Put the number into the input.
                targetSizeInput.value =
                    selectedSize;


                // Presets are always in KB.
                targetUnit.value =
                    "KB";

            }
        );

    }
);



/* =========================================================
   13. COMPRESS IMAGE
   ========================================================= */

/*
    THIS IS THE MOST IMPORTANT PART OF OUR PROJECT.

    This is where the FRONTEND communicates with
    our PYTHON FLASK BACKEND.

    The complete flow is:

        User clicks "Compress Image"
                    ↓
              JavaScript
                    ↓
               FormData
                    ↓
          Flask / Python Backend
                    ↓
                 Pillow
                    ↓
            Compressed Image
                    ↓
               JavaScript
                    ↓
              Download Image


    IMPORTANT:

    Our Flask backend is running locally at:

        http://127.0.0.1:5000

    And our compression API is:

        /compress

    Therefore the complete URL is:

        http://127.0.0.1:5000/compress
*/


compressButton.addEventListener(
    "click",
    async function () {

        /* =====================================================
           STEP 1 — CHECK WHETHER AN IMAGE WAS SELECTED
           ===================================================== */

        /*
            selectedImage contains the image selected
            by the user.

            If it is null, the user has not selected
            an image yet.
        */

        if (!selectedImage) {

            alert(
                "Please select an image first."
            );

            return;
        }



        /* =====================================================
           STEP 2 — FIND THE COMPRESSION MODE
           ===================================================== */

        /*
            We have TWO compression modes:

            1. Quality Mode
            2. Target File Size Mode

            Example:

            Quality Mode
                ↓
            User chooses 70%
                ↓
            Pillow compresses using quality = 70


            Target File Size Mode
                ↓
            User chooses 100 KB
                ↓
            Python repeatedly compresses
            until it reaches the target size.
        */

        let compressionMode;


        if (qualityMode.checked) {

            // User selected Quality Mode.
            compressionMode = "quality";

        } else {

            // User selected Target File Size Mode.
            compressionMode = "target";

        }



        /* =====================================================
           STEP 3 — GET OUTPUT FORMAT
           ===================================================== */

        /*
            formatSelect is connected to the dropdown
            in our HTML.

            It can return:

                webp
                jpg
                png
                jpeg
                gif
                bmp

            Example:

            If user selects JPG:

                selectedFormat = "jpg"
        */

        const selectedFormat =
            formatSelect.value;



        /* =====================================================
           STEP 4 — CREATE FORMDATA
           ===================================================== */

        /*
            FormData is like a package.

            We put all the information that Python needs
            inside this package.

            We will send:

                image
                mode
                format

            AND depending on the mode:

                quality

            OR:

                target_size
                target_unit
        */

        const formData =
            new FormData();



        /* =====================================================
           STEP 5 — PUT IMAGE INSIDE FORMDATA
           ===================================================== */

        /*
            "image" is the NAME that Flask expects.

            This must match the Python code:

                request.files["image"]

            selectedImage is the actual image file
            chosen by the user.
        */

        formData.append(
            "image",
            selectedImage
        );



        /* =====================================================
           STEP 6 — PUT COMPRESSION MODE INSIDE FORMDATA
           ===================================================== */

        /*
            Flask will receive:

                mode = "quality"

            OR:

                mode = "target"
        */

        formData.append(
            "mode",
            compressionMode
        );



        /* =====================================================
           STEP 7 — PUT OUTPUT FORMAT INSIDE FORMDATA
           ===================================================== */

        /*
            This sends the selected output format
            to our Python backend.

            Example:

            User selects:

                JPG

            JavaScript sends:

                format = "jpg"

            Python can then tell Pillow:

                Save the compressed image as JPG.
        */

        formData.append(
            "format",
            selectedFormat
        );



        /* =====================================================
           STEP 8 — QUALITY MODE
           ===================================================== */

        if (compressionMode === "quality") {

            /*
                Get the quality slider value.

                Example:

                    Slider = 70

                JavaScript sends:

                    quality = 70
            */

            const quality =
                qualitySlider.value;


            formData.append(
                "quality",
                quality
            );

        }



        /* =====================================================
           STEP 9 — TARGET FILE SIZE MODE
           ===================================================== */

        if (compressionMode === "target") {

            /*
                Get the target size entered by the user.

                Example:

                    100

                This means:

                    100 KB
            */

            const targetSize =
                targetSizeInput.value;



            /* -------------------------------------------------
               CHECK WHETHER TARGET SIZE WAS ENTERED
               ------------------------------------------------- */

            if (!targetSize) {

                alert(
                    "Please enter a target file size."
                );

                return;
            }



            /* -------------------------------------------------
               CONVERT INPUT INTO NUMBER
               ------------------------------------------------- */

            /*
                HTML input values are received as TEXT.

                Example:

                    "100"

                Number("100")

                becomes:

                    100
            */

            const targetNumber =
                Number(targetSize);



            /* -------------------------------------------------
               CHECK WHETHER NUMBER IS VALID
               ------------------------------------------------- */

            if (
                isNaN(targetNumber) ||
                targetNumber <= 0
            ) {

                alert(
                    "Please enter a valid target size."
                );

                return;
            }



            /* -------------------------------------------------
               SEND TARGET SIZE TO PYTHON
               ------------------------------------------------- */

            formData.append(
                "target_size",
                targetNumber
            );



            /* -------------------------------------------------
               SEND TARGET UNIT TO PYTHON
               ------------------------------------------------- */

            /*
                targetUnit can contain:

                    KB

                OR:

                    MB

                Example:

                    100 + KB

                means:

                    100 KB
            */

            formData.append(
                "target_unit",
                targetUnit.value
            );

        }



        /* =====================================================
           STEP 10 — SHOW LOADING STATE
           ===================================================== */

        /*
            Compression can take some time,
            especially Target File Size mode.

            Therefore we temporarily change the button
            text so the user knows something is happening.
        */

        compressButton.textContent =
            "Compressing...";


        compressButton.disabled =
            true;



        /* =====================================================
           STEP 11 — SEND DATA TO FLASK
           ===================================================== */

        try {

            /*
                THIS IS WHERE JAVASCRIPT CONNECTS TO PYTHON.

                fetch() sends an HTTP request.

                URL:

                    http://127.0.0.1:5000/compress

                Method:

                    POST

                Why POST?

                Because we are sending an image file
                and compression settings to the server.
            */

            const response =
                await fetch(
                    "http://127.0.0.1:5000/compress",
                    {
                        method: "POST",

                        /*
                            formData contains:

                                image
                                mode
                                format
                                quality

                            OR:

                                target_size
                                target_unit
                        */

                        body: formData
                    }
                );



            /* =================================================
               STEP 12 — CHECK SERVER RESPONSE
               ================================================= */

            /*
                response.ok tells us whether the server
                returned a successful HTTP response.

                If Flask returns an error,
                we stop here.
            */

            if (!response.ok) {

                /*
                    Try to get the actual error message
                    returned by Flask.

                    This makes debugging MUCH easier.
                */

                let errorMessage =
                    "Python backend returned an error.";

                try {

                    const errorData =
                        await response.json();

                    if (errorData.error) {

                        errorMessage =
                            errorData.error;

                    }

                } catch (error) {

                    /*
                        If Flask didn't return JSON,
                        we simply use our default message.
                    */

                }

                throw new Error(
                    errorMessage
                );

            }



            /* =================================================
               STEP 13 — RECEIVE COMPRESSED IMAGE
               ================================================= */

            /*
                Flask sends the compressed image back
                as a file.

                response.blob()

                converts the server response into a
                browser Blob object.

                Blob = binary data such as an image.
            */

            const compressedBlob =
                await response.blob();



            /* =================================================
               STEP 14 — DISPLAY ORIGINAL FILE SIZE
               ================================================= */

            /*
                selectedImage.size gives the original
                file size in BYTES.

                formatFileSize() converts it into:

                    KB
                    MB
                    etc.
            */

            originalSize.textContent =
                formatFileSize(
                    selectedImage.size
                );



            /* =================================================
               STEP 15 — DISPLAY COMPRESSED FILE SIZE
               ================================================= */

            /*
                compressedBlob.size gives us the size
                of the image returned by Python.
            */

            compressedSize.textContent =
                formatFileSize(
                    compressedBlob.size
                );



            /* =================================================
               STEP 16 — CREATE TEMPORARY IMAGE URL
               ================================================= */

            /*
                The browser cannot directly use the Blob
                as a download link.

                URL.createObjectURL()

                creates a temporary URL for the Blob.

                Example:

                    blob:127.0.0.1/abc123
            */

            compressedImageURL =
                URL.createObjectURL(
                    compressedBlob
                );



            /* =================================================
               STEP 17 — SHOW RESULT SECTION
               ================================================= */

            /*
                The result section was hidden initially.

                Now that compression is complete,
                we show it.
            */

            compressionResult.style.display =
                "block";


            /*
                Scroll to the result so the user
                immediately sees the result.
            */

            compressionResult.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });



            /* =================================================
               STEP 18 — SUCCESS MESSAGE
               ================================================= */

            console.log(
                "Image compressed successfully!"
            );

            console.log(
                "Original:",
                formatFileSize(selectedImage.size)
            );

            console.log(
                "Compressed:",
                formatFileSize(compressedBlob.size)
            );


        } catch (error) {

            /* =================================================
               ERROR HANDLING
               ================================================= */

            /*
                If anything goes wrong:

                    JavaScript catches the error
                    ↓
                    Console shows the error
                    ↓
                    User gets an alert
            */

            console.error(
                "Compression error:",
                error
            );


            alert(
                "Compression failed: " +
                error.message
            );


        } finally {

            /* =================================================
               STEP 19 — RESTORE BUTTON
               ================================================= */

            /*
                Whether compression succeeds OR fails,
                we need to restore the button.
            */

            compressButton.textContent =
                "Compress Image";


            compressButton.disabled =
                false;

        }

    }
);



/* =========================================================
   14. GET ORIGINAL FILE NAME
   ========================================================= */

/*
    We don't want every download to be called:

        compressed-image.webp

    Instead, if the user uploads:

        burger.webp

    we want:

        burger-compressed.webp

    This function removes the original extension
    from the filename.
*/

function getFileNameWithoutExtension(
    fileName
) {


    /*
        lastIndexOf(".") finds the final dot
        in the filename.

        Example:

            burger.webp

        gives the position of "."
    */

    const lastDot =
        fileName.lastIndexOf(".");


    /*
        If there is no extension,
        return the complete filename.
    */

    if (lastDot === -1) {

        return fileName;

    }


    /*
        substring() takes everything before
        the final dot.

        burger.webp

             ↓

        burger
    */

    return fileName.substring(
        0,
        lastDot
    );

}



/* =========================================================
   15. DOWNLOAD COMPRESSED IMAGE
   ========================================================= */

/*
    The Download button uses the compressed
    image returned from Python.

    We also create the correct filename
    based on:

        Original filename
        Selected output format
*/


downloadButton.addEventListener(
    "click",
    function () {


        /* -------------------------------------------------
           CHECK WHETHER COMPRESSION HAS HAPPENED
           ------------------------------------------------- */

        if (!compressedImageURL) {

            alert(
                "Please compress an image first."
            );

            return;
        }



        /* -------------------------------------------------
           GET ORIGINAL FILE NAME
           ------------------------------------------------- */

        const originalName =
            getFileNameWithoutExtension(
                selectedImage.name
            );



        /* -------------------------------------------------
           GET SELECTED FORMAT
           ------------------------------------------------- */

        const selectedFormat =
            formatSelect.value;



        /* -------------------------------------------------
           CREATE FINAL DOWNLOAD NAME
           ------------------------------------------------- */

        /*
            Example:

            Original:
                burger.webp

            Selected format:
                jpg

            Final name:
                burger-compressed.jpg
        */

        const downloadFileName =
            originalName
            + "-compressed."
            + selectedFormat;



        /* -------------------------------------------------
           CREATE TEMPORARY DOWNLOAD LINK
           ------------------------------------------------- */

        const link =
            document.createElement("a");


        // Connect the compressed image to the link.
        link.href =
            compressedImageURL;


        // Set the correct filename.
        link.download =
            downloadFileName;


        // Temporarily add link to page.
        document.body.appendChild(
            link
        );


        // Automatically click it.
        link.click();


        // Remove temporary link.
        document.body.removeChild(
            link
        );

    }
);