# ============================================================
# COMPRESSIFY - IMAGE COMPRESSOR
# ============================================================
#
# This file is the BACKEND of our application.
#
# Frontend:
#   HTML  -> structure of the website
#   CSS   -> design of the website
#   JS    -> communicates with this Python backend
#
# Backend:
#   Python + Flask -> receives the image and settings
#   Pillow         -> actually processes/compresses image
#
# ============================================================


# ============================================================
# 1. IMPORT LIBRARIES
# ============================================================

# Flask is a Python framework that allows us to create
# a web server and API.
#
# Our JavaScript will send requests to this Flask server.
from flask import Flask, request, send_file, jsonify


# Flask-CORS allows our frontend and backend to communicate
# when they are running on different ports.
#
# Example:
#
# Frontend -> http://127.0.0.1:5500
#
# Backend  -> http://127.0.0.1:5000
#
# These are different ports, so CORS allows communication
# between them.
from flask_cors import CORS


# Pillow is the Python library responsible for
# opening, resizing, converting and compressing images.
#
# We installed Pillow using:
#
# pip install pillow
#
from PIL import Image


# BytesIO allows us to temporarily keep our compressed
# image in computer memory.
#
# This means we don't need to permanently save every
# compressed image on the server.
from io import BytesIO


# ============================================================
# 2. CREATE FLASK APPLICATION
# ============================================================

# Create our Flask application.
#
# "app" is the name we will use for our Flask server.
app = Flask(__name__)


# Enable CORS.
#
# This allows:
#
# Frontend JavaScript
#        ↓
# Python Flask backend
#
# to communicate with each other.
CORS(app)


# ============================================================
# 3. SUPPORTED OUTPUT FORMATS
# ============================================================

# These are the formats that the USER can select
# from the dropdown menu in index.html.
#
# Your HTML currently contains:
#
# WEBP
# JPG
# PNG
# JPEG
# GIF
# BMP
#
SUPPORTED_FORMATS = [
    "webp",
    "jpg",
    "png",
    "jpeg",
    "gif",
    "bmp"
]


# ============================================================
# 4. HOME ROUTE
# ============================================================

# This is a simple route used to check whether
# our Python backend is running.
#
# If you open:
#
# http://127.0.0.1:5000/
#
# you should see:
#
# Compressify backend is running!
#
@app.route("/")
def home():

    # Send a simple text response to the browser.
    return "Compressify backend is running!"


# ============================================================
# 5. FUNCTION:
#    CONVERT FORMAT NAME FOR PILLOW
# ============================================================

def get_pillow_format(selected_format):

    """
    This function converts the format name received
    from our frontend into the format name expected
    by Pillow.
    
    For example:
    
        Frontend sends:
        
        "jpg"
        
        Pillow expects:
        
        "JPEG"
        
    """

    # Pillow uses "JPEG" instead of "JPG".
    if selected_format in ["jpg", "jpeg"]:

        return "JPEG"


    # For the remaining formats, simply convert
    # the name to uppercase.
    #
    # webp -> WEBP
    # png  -> PNG
    # gif  -> GIF
    # bmp  -> BMP
    return selected_format.upper()


# ============================================================
# 6. FUNCTION:
#    PREPARE IMAGE FOR SELECTED FORMAT
# ============================================================

def prepare_image(image, selected_format):

    """
    This function prepares the image before compression.
    
    Different image formats support different things.
    
    For example:
    
    JPG DOES NOT support transparency.
    
    So if the original image is:
    
        RGBA
    
    we convert it to:
    
        RGB
    
    before creating a JPG.
    """


    # ========================================================
    # JPG / JPEG
    # ========================================================

    if selected_format in ["jpg", "jpeg"]:

        # JPG cannot store transparent pixels.
        #
        # RGBA = Red + Green + Blue + Alpha
        #
        # Alpha represents transparency.

        if image.mode in ["RGBA", "LA", "P"]:

            # Create a white background with
            # exactly the same size as our image.
            background = Image.new(
                "RGB",
                image.size,
                "white"
            )


            # Palette images need to be converted
            # before we can handle transparency.
            if image.mode == "P":

                image = image.convert("RGBA")


            # If the image contains transparency,
            # place it on the white background.
            if image.mode == "RGBA":

                background.paste(
                    image,
                    mask=image.getchannel("A")
                )

            else:

                background.paste(image)


            # Replace the original image with
            # our RGB image.
            image = background


        else:

            # If the image is already normal RGB,
            # simply make sure it is RGB.
            image = image.convert("RGB")


    # ========================================================
    # WEBP
    # ========================================================

    elif selected_format == "webp":

        # WEBP can work with RGB and RGBA.
        #
        # If the image has another mode,
        # convert it to RGB.
        if image.mode not in ["RGB", "RGBA"]:

            image = image.convert("RGB")


    # ========================================================
    # PNG
    # ========================================================

    elif selected_format == "png":

        # PNG supports transparency.
        #
        # Therefore we don't force the image
        # into RGB here.
        #
        # "pass" means:
        #
        # "Nothing needs to be changed."
        pass


    # ========================================================
    # GIF
    # ========================================================

    elif selected_format == "gif":

        # GIF generally uses a palette-based image.
        #
        # Therefore convert the image to palette mode
        # if necessary.
        if image.mode not in ["P", "L"]:

            image = image.convert(
                "P",
                palette=Image.Palette.ADAPTIVE
            )


    # ========================================================
    # BMP
    # ========================================================

    elif selected_format == "bmp":

        # BMP normally works with RGB/RGBA.
        if image.mode not in ["RGB", "RGBA"]:

            image = image.convert("RGB")


    # Return the prepared image.
    return image


# ============================================================
# 7. FUNCTION:
#    ENCODE / COMPRESS IMAGE
# ============================================================

def encode_image(image, selected_format, quality=70):

    """
    This is the function that actually creates
    the compressed image.
    
    It receives:
    
        image
        selected format
        quality
    
    and returns:
    
        compressed image data
    """


    # Create temporary memory storage.
    #
    # Instead of saving:
    #
    # compressed.jpg
    #
    # on our computer immediately,
    # we temporarily keep it in memory.
    output = BytesIO()


    # Convert "jpg" to "JPEG", etc.
    pillow_format = get_pillow_format(
        selected_format
    )


    # ========================================================
    # JPEG
    # ========================================================

    if pillow_format == "JPEG":

        # quality can be between 10 and 100.
        #
        # Higher quality:
        #       better image
        #       larger file
        #
        # Lower quality:
        #       smaller file
        #       lower image quality
        image.save(
            output,
            format="JPEG",
            quality=quality,
            optimize=True
        )


    # ========================================================
    # WEBP
    # ========================================================

    elif pillow_format == "WEBP":

        # WEBP also supports a quality value.
        image.save(
            output,
            format="WEBP",
            quality=quality,
            method=6
        )


    # ========================================================
    # PNG
    # ========================================================

    elif pillow_format == "PNG":

        # PNG is lossless.
        #
        # Therefore the JPEG-style quality parameter
        # does not work the same way.
        #
        # Instead we use optimization.
        image.save(
            output,
            format="PNG",
            optimize=True,
            compress_level=9
        )


    # ========================================================
    # GIF
    # ========================================================

    elif pillow_format == "GIF":

        image.save(
            output,
            format="GIF",
            optimize=True
        )


    # ========================================================
    # BMP
    # ========================================================

    elif pillow_format == "BMP":

        image.save(
            output,
            format="BMP"
        )


    # Move the memory pointer back to the beginning.
    #
    # Without this, Flask may start reading from
    # the END of the file.
    output.seek(0)


    # Convert the BytesIO object into actual bytes.
    #
    # These bytes represent our compressed image.
    return output.getvalue()


# ============================================================
# 8. FUNCTION:
#    COMPRESS IMAGE TO TARGET FILE SIZE
# ============================================================

def compress_to_target(
    original_image,
    selected_format,
    target_bytes
):

    """
    THIS IS THE MAIN FEATURE FOR:
    
        50 KB
        100 KB
        200 KB
        500 KB
        Custom target
    
    Example:
    
        User selects:
    
        Target File Size
        100 KB
    
        JavaScript sends 100 KB to Python.
    
        Python converts:
    
        100 KB
            ↓
        102400 bytes
    
        Then this function tries to create
        an image that is <= 102400 bytes.
    """


    # Make a copy of the original image.
    #
    # We never want to modify the user's original image.
    image = original_image.copy()


    # Store the original dimensions.
    original_width, original_height = image.size


    # Initially, we use the original dimensions.
    current_width = original_width
    current_height = original_height


    # This prevents our program from resizing forever.
    max_resize_attempts = 25


    # Count how many times we resize.
    resize_attempt = 0


    # ========================================================
    # KEEP TRYING UNTIL TARGET IS REACHED
    # ========================================================

    while resize_attempt < max_resize_attempts:


        # ====================================================
        # STEP 1:
        # RESIZE IMAGE IF NECESSARY
        # ====================================================

        # If dimensions have changed, create a resized copy.
        if (
            current_width != original_width
            or
            current_height != original_height
        ):

            working_image = original_image.resize(
                (
                    current_width,
                    current_height
                ),
                Image.Resampling.LANCZOS
            )

        else:

            # If this is the first attempt,
            # simply use the original dimensions.
            working_image = original_image.copy()


        # ====================================================
        # STEP 2:
        # PREPARE IMAGE
        # ====================================================

        # Make the image compatible with
        # the selected output format.
        working_image = prepare_image(
            working_image,
            selected_format
        )


        # ====================================================
        # STEP 3:
        # JPG / JPEG / WEBP
        # ====================================================

        if selected_format in [
            "jpg",
            "jpeg",
            "webp"
        ]:


            # ------------------------------------------------
            # First try the lowest quality.
            # ------------------------------------------------

            # Quality 10 creates a very small image.
            lowest_quality_data = encode_image(
                working_image,
                selected_format,
                quality=10
            )


            # ------------------------------------------------
            # Is even quality 10 too large?
            # ------------------------------------------------

            if len(lowest_quality_data) > target_bytes:

                # If yes, simply reducing quality
                # isn't enough.
                #
                # We must also reduce the dimensions.
                #
                # Reduce width and height by 15%.

                new_width = int(
                    current_width * 0.85
                )

                new_height = int(
                    current_height * 0.85
                )


                # Never allow dimensions to become 0.
                new_width = max(
                    20,
                    new_width
                )

                new_height = max(
                    20,
                    new_height
                )


                # Save our new dimensions.
                current_width = new_width
                current_height = new_height


                # Increase resize counter.
                resize_attempt += 1


                # Go back to the beginning of the loop
                # and try again.
                continue


            # =================================================
            # STEP 4:
            # FIND BEST QUALITY
            # =================================================

            """
            At this point:
            
                quality 10
                    ↓
                fits inside target
            
            Now we want the HIGHEST possible quality
            that still fits.
            
            Example:
            
                100 KB target
            
                Quality 10 -> 70 KB
                Quality 50 -> 90 KB
                Quality 70 -> 130 KB
            
            Therefore quality 50 is better than 10.
            
            We use BINARY SEARCH to find it efficiently.
            """


            # Lowest quality we are willing to use.
            low = 10


            # Highest quality we will try.
            high = 95


            # Start with the known working version.
            best_data = lowest_quality_data


            # Remember the quality that produced it.
            best_quality = 10


            # ------------------------------------------------
            # BINARY SEARCH
            # ------------------------------------------------

            while low <= high:


                # Find middle quality.
                middle = (
                    low + high
                ) // 2


                # Compress using this quality.
                test_data = encode_image(
                    working_image,
                    selected_format,
                    quality=middle
                )


                # Check the size.
                if len(test_data) <= target_bytes:

                    # SUCCESS!
                    #
                    # This quality fits inside
                    # the requested target.
                    best_data = test_data


                    best_quality = middle


                    # Since this quality works,
                    # let's see if we can use an even
                    # HIGHER quality.
                    low = middle + 1


                else:

                    # Image is too large.
                    #
                    # Therefore quality is too high.
                    #
                    # Try a lower quality.
                    high = middle - 1


            # =================================================
            # STEP 5:
            # TARGET REACHED
            # =================================================

            if len(best_data) <= target_bytes:

                # Return:
                #
                # compressed image
                # final width
                # final height
                # quality used
                return (
                    best_data,
                    current_width,
                    current_height,
                    best_quality
                )


        # ====================================================
        # PNG / GIF / BMP
        # ====================================================

        else:

            """
            PNG, GIF and BMP don't behave like JPEG/WEBP
            when it comes to quality.
            
            Therefore we can't simply do:
            
                quality = 70
                quality = 50
                quality = 30
            
            Instead, we resize the image if it is
            larger than the requested target.
            """


            # Encode the image.
            test_data = encode_image(
                working_image,
                selected_format,
                quality=70
            )


            # Check whether it fits.
            if len(test_data) <= target_bytes:

                # Target reached.
                return (
                    test_data,
                    current_width,
                    current_height,
                    None
                )


        # ====================================================
        # STEP 6:
        # IMAGE IS STILL TOO LARGE
        # ====================================================

        # Reduce dimensions by another 15%.
        #
        # IMPORTANT:
        #
        # We reduce width AND height by the same percentage.
        #
        # This keeps the image's aspect ratio.
        current_width = max(
            20,
            int(current_width * 0.85)
        )

        current_height = max(
            20,
            int(current_height * 0.85)
        )


        # Increase resize counter.
        resize_attempt += 1


    # ========================================================
    # 9. FINAL FALLBACK
    # ========================================================

    """
    If we reach here, the requested target was
    extremely difficult to achieve.
    
    We make one final small version of the image.
    """


    # Create final resized image.
    final_image = original_image.resize(
        (
            max(20, current_width),
            max(20, current_height)
        ),
        Image.Resampling.LANCZOS
    )


    # Prepare it for the selected format.
    final_image = prepare_image(
        final_image,
        selected_format
    )


    # Compress at the lowest quality.
    final_data = encode_image(
        final_image,
        selected_format,
        quality=10
    )


    # Return final result.
    return (
        final_data,
        final_image.width,
        final_image.height,
        10
    )


# ============================================================
# 10. MAIN COMPRESSION API ROUTE
# ============================================================

# THIS IS THE MOST IMPORTANT CONNECTION.
#
# Your JavaScript will send the image here:
#
#     fetch("http://127.0.0.1:5000/compress", ...)
#
# And Flask will execute:
#
#     compress_image()
#
# "POST" means JavaScript is SENDING data to Python.
#
@app.route(
    "/compress",
    methods=["POST"]
)
def compress_image():


    # ========================================================
    # STEP 1:
    # RECEIVE IMAGE FROM JAVASCRIPT
    # ========================================================

    # JavaScript sends the image using the name:
    #
    # "image"
    #
    # Therefore Python looks for:
    #
    # request.files["image"]

    if "image" not in request.files:

        return jsonify({
            "error":
            "No image was uploaded."
        }), 400


    # Store the uploaded image.
    uploaded_image = request.files["image"]


    # Check if the user actually selected a file.
    if uploaded_image.filename == "":

        return jsonify({
            "error":
            "No image was selected."
        }), 400


    # ========================================================
    # STEP 2:
    # RECEIVE COMPRESSION MODE
    # ========================================================

    # JavaScript sends something like:
    #
    # mode = "quality"
    #
    # OR:
    #
    # mode = "target"
    #
    compression_mode = request.form.get(
        "mode",
        "quality"
    )


    # ========================================================
    # STEP 3:
    # RECEIVE OUTPUT FORMAT
    # ========================================================

    # JavaScript gets this from:
    #
    # <select id="formatSelect">
    #
    # Example:
    #
    # WEBP
    # JPG
    # PNG
    #
    selected_format = request.form.get(
        "format",
        "webp"
    ).lower().strip()


    # Check whether the selected format is supported.
    if selected_format not in SUPPORTED_FORMATS:

        return jsonify({
            "error":
            "Unsupported output format."
        }), 400


    # ========================================================
    # STEP 4:
    # OPEN IMAGE USING PILLOW
    # ========================================================

    try:

        # Pillow opens the uploaded image.
        image = Image.open(
            uploaded_image
        )


        # Make a copy.
        #
        # This ensures the original uploaded image
        # isn't modified.
        image = image.copy()


    except Exception as error:

        # If Pillow cannot open the image,
        # return an error to JavaScript.
        return jsonify({
            "error":
            "Could not open image.",

            "details":
            str(error)

        }), 400


    # ========================================================
    # MODE 1:
    # NORMAL QUALITY COMPRESSION
    # ========================================================

    if compression_mode == "quality":


        # ----------------------------------------------------
        # Receive quality from JavaScript.
        #
        # Example:
        #
        # 70
        # ----------------------------------------------------

        quality = request.form.get(
            "quality",
            "70"
        )


        # Convert text to integer.
        try:

            quality = int(quality)

        except ValueError:

            # If something goes wrong,
            # use 70 as default.
            quality = 70


        # Make sure quality stays between 10 and 100.
        quality = max(
            10,
            min(100, quality)
        )


        # Prepare image for selected format.
        image = prepare_image(
            image,
            selected_format
        )


        # Compress image using selected quality.
        compressed_data = encode_image(
            image,
            selected_format,
            quality
        )


    # ========================================================
    # MODE 2:
    # TARGET FILE SIZE
    # ========================================================

    elif compression_mode == "target":


        # ----------------------------------------------------
        # Receive target size from JavaScript.
        #
        # Example:
        #
        # 100
        # ----------------------------------------------------

        target_size = request.form.get(
            "target_size"
        )


        # Receive unit.
        #
        # Example:
        #
        # KB
        # MB
        #
        target_unit = request.form.get(
            "target_unit",
            "KB"
        )


        # Make sure user entered a target.
        if not target_size:

            return jsonify({
                "error":
                "Please enter a target file size."
            }), 400


        # ----------------------------------------------------
        # Convert target size to number.
        # ----------------------------------------------------

        try:

            target_number = float(
                target_size
            )

        except ValueError:

            return jsonify({
                "error":
                "Target size must be a number."
            }), 400


        # Target cannot be zero or negative.
        if target_number <= 0:

            return jsonify({
                "error":
                "Target size must be greater than 0."
            }), 400


        # ====================================================
        # CONVERT KB / MB INTO BYTES
        # ====================================================

        """
        Computers measure file sizes in BYTES.
        
        So if the user says:
        
            100 KB
        
        Python needs:
        
            100 × 1024
        
        = 102400 bytes
        """


        if target_unit.upper() == "MB":

            target_bytes = int(
                target_number
                * 1024
                * 1024
            )

        else:

            # Default unit is KB.
            target_bytes = int(
                target_number
                * 1024
            )


        # Make sure target isn't ridiculously tiny.
        if target_bytes < 1024:

            return jsonify({
                "error":
                "Target size must be at least 1 KB."
            }), 400


        # ====================================================
        # CALL TARGET COMPRESSION FUNCTION
        # ====================================================

        """
        This is where our main target-size algorithm
        is connected.
        
        We pass:
        
            original image
            selected format
            target size in bytes
        
        to:
        
            compress_to_target()
        """


        try:

            (
                compressed_data,
                final_width,
                final_height,
                final_quality
            ) = compress_to_target(

                image,

                selected_format,

                target_bytes

            )


        except Exception as error:

            return jsonify({
                "error":
                "Target compression failed.",

                "details":
                str(error)

            }), 500


    # ========================================================
    # UNKNOWN COMPRESSION MODE
    # ========================================================

    else:

        return jsonify({
            "error":
            "Unknown compression mode."
        }), 400


    # ========================================================
    # STEP 5:
    # CREATE DOWNLOAD FILE NAME
    # ========================================================

    # Suppose original file is:
    #
    # burger.webp
    #
    # and user selected JPG.
    #
    # We create:
    #
    # burger-compressed.jpg


    original_filename = (
        uploaded_image.filename
    )


    # Remove the original extension.
    original_name = (
        original_filename.rsplit(
            ".",
            1
        )[0]
    )


    # Create the final filename.
    download_filename = (
        original_name
        + "-compressed."
        + selected_format
    )


    # ========================================================
    # STEP 6:
    # SELECT MIME TYPE
    # ========================================================

    # The browser needs to know what kind of
    # file we are sending back.

    if selected_format in [
        "jpg",
        "jpeg"
    ]:

        mime_type = "image/jpeg"


    elif selected_format == "webp":

        mime_type = "image/webp"


    elif selected_format == "png":

        mime_type = "image/png"


    elif selected_format == "gif":

        mime_type = "image/gif"


    elif selected_format == "bmp":

        mime_type = "image/bmp"


    else:

        mime_type = (
            "application/octet-stream"
        )


    # ========================================================
    # STEP 7:
    # PUT COMPRESSED IMAGE INTO MEMORY
    # ========================================================

    # Convert our compressed bytes into a file-like
    # object that Flask can send to the browser.
    output = BytesIO(
        compressed_data
    )


    # Move pointer to beginning.
    output.seek(0)


    # ========================================================
    # STEP 8:
    # SEND COMPRESSED IMAGE BACK TO FRONTEND
    # ========================================================

    """
    THIS IS THE OTHER IMPORTANT CONNECTION.
    
    We previously had:
    
        JavaScript
             ↓
        Python
    
    Now we have:
    
        Python
             ↓
        JavaScript
    
    Flask sends the compressed image back.
    
    Your JavaScript can then turn that response
    into a downloadable file.
    """


    return send_file(

        output,

        # Tell browser what type of image it is.
        mimetype=mime_type,

        # We let JavaScript handle the download.
        as_attachment=False,

        # Suggested filename.
        download_name=download_filename

    )


# ============================================================
# 11. START FLASK SERVER
# ============================================================

# This block runs when we start the application directly.
if __name__ == "__main__":

    # 0.0.0.0 allows Render to receive requests from
    # outside the server.
    #
    # Render provides the PORT number through an
    # environment variable, so we read it here.

    import os

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )