---
title: "From a Stock Panel to a Studio"
description: "Turning a 13.3-inch six-color e-paper panel into a networked art display with ESP32 firmware, a Python studio API, and a Next.js interface."
publishedAt: 2026-11-08T15:58:33-08:00
technologies:
  [
    "ESP32-S3",
    "ESP-IDF",
    "E-Paper",
    "Python",
    "Pillow",
    "Next.js",
    "React",
    "Tailwind CSS",
  ]
github: "https://github.com/lucas-ault/e-ink-art-and-more"
type: "Personal"
status: "active"
year: 2026
featured: false
draft: false
---

## Overview

This project started with an ESP32-S3, a 13.3-inch Good Display Spectra 6 panel, and the vendor's ESP-IDF example.

The example could drive the display, but I wanted something closer to a digital art frame: upload an image or enter a URL, crop it for the glass, preview the six-color result, save it to a library, and send it to the panel from a browser.

The panel is 1200 by 1600 pixels and supports six colors with no grayscale. A full refresh takes roughly half a minute, but the finished image remains visible without continuous power. That makes it a good fit for artwork that changes occasionally rather than a conventional screen that redraws constantly.

The most important design decision was keeping the board simple. The ESP32 never renders a web page, resizes an image, or dithers a photograph. It joins Wi-Fi, accepts one packed frame, and refreshes the panel. A computer handles everything else through a Python API and a Next.js interface.

## Technology Stack

- **ESP32-S3** — Connects the panel to Wi-Fi, receives finished frames, and controls each refresh.
- **ESP-IDF** — Provides the firmware, networking, HTTP server, and non-volatile Wi-Fi storage.
- **Good Display GDEP133C02** — The 13.3-inch, 1200×1600, six-color e-paper panel.
- **Python and Pillow** — Load, crop, resize, dither, pack, preview, and store artwork.
- **Headless Chrome** — Captures web pages at the panel's resolution when a URL is not a direct image.
- **Next.js and React** — Provide the browser-based studio for uploading, selecting, and displaying art.
- **Tailwind CSS** — Styles the responsive desktop and mobile interface.

## Drawing the Boundary

My first thought was to have the ESP32 load a page itself. That would have pushed HTML, fonts, layout, image decoding, and color conversion onto a small embedded board, only to end with the same packed framebuffer the panel needs anyway.

Instead, the system is split into four steps:

1. The computer opens an image or captures a page at 1200×1600.
2. It crops the source, converts it to the panel's six colors, and packs the pixels.
3. It sends the completed 960,000-byte frame to the ESP32.
4. The board streams that frame to the panel and starts the vendor refresh sequence.

This keeps the firmware focused on the hardware and leaves the expensive, changeable image processing on the computer.

It also creates a useful boundary for future automation. The web app is only one client of the studio API. A page watcher, schedule, or MQTT subscriber can eventually call the same Show and Next operations without requiring new panel firmware.

## Building the Panel Firmware

The vendor example remained useful as a reference for panel commands, timing, and waveforms, but it was not the application I wanted to run.

The replacement firmware adds Wi-Fi station support and a small HTTP server around the display driver. On startup, it paints the panel white, joins the network, and waits for a frame.

Each byte contains two pixels. The left pixel is stored in the high nibble and the right pixel in the low nibble. With 1200 pixels per row and 1600 rows, one complete frame is 960,000 bytes.

That buffer has to live in PSRAM. Internal memory is not large enough to hold it alongside the HTTP server and the rest of the firmware.

The byte order was also responsible for one of the first visible bugs. My initial packer wrote each row in the wrong direction, so every image appeared mirrored on the glass. Correcting the packing order fixed the image without changing the display driver.

The firmware exposes only a small set of operations: report health, accept a frame, clear the panel, and manage Wi-Fi. Refresh and clear share a busy state, so another request receives a clear conflict response instead of waiting silently behind a 30-second update.

## Getting It onto the Network

The panel normally joins the existing house Wi-Fi rather than creating its own permanent access point.

Initial credentials can be compiled into a gitignored firmware header. After the first successful connection, the board stores them in non-volatile storage and uses them on future boots.

That works until the network changes, so the firmware also has a recovery path. If it cannot get an address, it opens a temporary `panel-setup` network with a small phone-friendly configuration page. The station interface remains active while the setup interface is available.

When new credentials are submitted, the board tries the new network first. If that fails, it restores the previous credentials. If neither network works, the setup network returns.

This means changing the SSID does not require rebuilding or reflashing the firmware, and a failed change does not necessarily strand the panel.

## Making a Six-Color Picture

The Python studio is where images become panel frames.

A file upload is opened directly. A URL is downloaded and inspected: direct images are treated like uploads, while normal web pages are captured with headless Chrome at the panel's full resolution.

The selected crop is resized to 1200×1600 and converted to the panel's black, white, yellow, red, blue, and green palette using Floyd–Steinberg dithering. The algorithm chooses the nearest supported color for each pixel and distributes the remaining color error into nearby pixels.

The result cannot reproduce every color, but the dither pattern creates the impression of more detail than six flat colors alone would allow.

The preview is decoded from the same packed bytes that will be sent to the panel. It is not a separate approximation produced by the browser. That makes the preview useful for checking both the palette and the packing before committing to a slow physical refresh.

## The Studio API and Library

The studio API is a local Python service. It does not serve the interface itself; both the Next.js app and command-line tools are clients of the same API.

New uploads and page captures begin as temporary sources held in memory. Saving one creates a persistent library piece with:

- The original image before cropping.
- The packed 960,000-byte frame.
- Metadata such as its title, source type, crop, and date added.
- A generated preview of the stored frame.

Packing happens when the piece is saved. Showing it later only reads the finished frame and sends it to the board, so selecting saved art does not repeat the expensive dithering step.

The library also records its order and the last piece successfully sent to the glass. That allows Next to move through the collection and wrap back to the beginning, while the Currently Showing page can recover after the API restarts.

Clearing the glass does not erase that record. The display becomes white, but the studio still knows which piece was last sent.

## Building the Browser Interface

The interface is a Next.js App Router application with four main areas:

- **Currently Showing** — Displays the last piece, panel reachability, and whether the board is refreshing. It also provides Next and Clear actions.
- **Upload Art** — Accepts a local file or URL, provides a 3:4 cropper, generates a six-color preview, and saves and shows the result.
- **Select Art** — Browses the persistent library and lets me show or remove individual pieces.
- **Settings** — Stores the panel address and manages the board's Wi-Fi connection.

The layout uses a side navigation on larger screens and a fixed bottom navigation on phones.

The cropper starts with the image covering the frame rather than fitting inside it, avoiding letterboxing. Dragging pans the image, while zooming keeps the crop at the panel's 3:4 aspect ratio. The browser reports the crop in source-image coordinates, leaving the final resize and conversion to Python.

Showing a new upload intentionally happens in two operations. The studio saves the processed piece first and then sends it to the panel. If the board is offline or busy, the artwork remains in the library and can be retried later rather than being lost.

Next.js proxies API calls to the local Python service, so the browser only talks to one origin. The proxy timeout is long enough for a complete panel refresh; a normal web timeout would otherwise report failure even while the board continues updating successfully.

## One Picture, End to End

Showing a page URL now looks like this:

1. The interface sends the URL to the studio API.
2. The API recognizes that it is a page and captures it with headless Chrome.
3. The cropper sends a 3:4 source rectangle for previewing.
4. The API resizes and dithers that crop, then returns a six-color preview.
5. Saving writes the original, metadata, and packed frame to the library.
6. Showing reads the stored frame and sends it to the panel.
7. The ESP32 receives the frame into PSRAM and runs the full refresh.
8. After the board finishes, the API records the piece as the last one shown.

Using Next or choosing an existing library piece skips the capture, crop, and conversion work. Those actions begin with the already packed frame.

## Testing the Complete System

I tested the full path against the live panel on the house network.

Both uploaded files and page URLs became saved pieces with six-color previews. I could show a new upload, advance to the next item, select an earlier piece from the library, and clear the panel back to white.

The Settings page reported the active Wi-Fi network and panel status. Calling Next directly from the command line advanced the same library used by the interface and wrapped from the final piece to the first.

I also restarted the API to confirm that the library order and last-shown record survived. The panel firmware did not need to change when the library and Next.js app were added, which was a useful confirmation that the boundary was in the right place.

## What's Next?

The API is ready for another client, but I have not added one yet.

- **Scheduling** — Rotate through selected artwork at specific times.
- **Page watching** — Capture a page again when its content changes.
- **MQTT integration** — Let other homelab services request a saved piece or advance the library.
- **Retry handling** — Wait for the board's busy state to clear and retry queued changes.
- **Remote hosting** — Decide whether the studio should remain local or become another privately accessible homelab service.

None of these require the ESP32 to understand schedules, websites, or message brokers. They can remain clients of the same API while the board continues to receive completed frames.

## Final Thoughts

The project became much easier to reason about once the display stopped being treated like a tiny web browser.

The ESP32 handles the things tied closely to the hardware: Wi-Fi, buffering, SPI, and refresh timing. Python handles image processing and persistence. Next.js provides the interaction layer. Each part has a narrow responsibility, and the packed frame is the contract between them.

What began as a vendor demonstration is now a small studio for preparing, organizing, and displaying art. More importantly, it has room to grow without making the firmware responsible for every new idea.
