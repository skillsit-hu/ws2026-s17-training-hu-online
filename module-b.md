# Test Project Outline - Module B - Speedtest

## Competition time

Competitors will have **1 hour** to complete Module B.

## Introduction

This module requires you to complete a series of independent tasks. The tasks are designed to test your knowledge of HTML, CSS, JavaScript, and basic algorithms.

- Tasks beginning with A require you to use HTML and CSS, not JavaScript.
- For tasks beginning with B, you can (and must) use JavaScript.
- For the C tasks you are required to use JavaScript and basic Data Structures & Algorithms knowledge.

## Project structure

You can create your repository using the `vanilla-js-app` template. Then, create 9 folders for each task: `a1`, `a2`, etc. Inside these folders, place an `index.html` file where your solution should be. Please also place any media in the task's subfolder. When deployed, we should be able to access your solution on the `/a1`, `/a2`, etc. paths.

Your `/c1`, `/c2`, and `/c3` folders should only contain the `index.js` file. We will run them locally.

---

## Tasks

### A1: CSS Heart Shape (Easy)

Using CSS, create a heart shape.

### A2: Mac Taskbar Magnifying Animation (Medium)

Using HTML and CSS only, please create the Apple MacBook taskbar magnifying animation. Please refer to the video example for a better understanding of the task.

You are provided with some starting styles, so you do not have to worry about them.

### A3: 3D Rubik's Cube (Hard)

A Rubik's Cube is a 3D combination color-matching puzzle invented in 1974 by Hungarian architect Ernő Rubik. Create a 3D Rubik's Cube using only HTML and CSS. The cube should be centered both vertically and horizontally on the screen. The cube should rotate constantly with animation, as seen in the video example.

The cube has the following sides:

- Top: **white**
- Bottom: **yellow**
- Front: **red**
- Back: **orange**
- Left: **green**
- Right: **blue**

### B1: Picture in Picture (Easy)

Given a video in the assets. Display the video on the screen. Initially, the video is paused. Also display a "Toggle Picture in Picture" button.  
When clicking this button, the video starts playing in picture-in-picture mode. This means that the video starts playing in the lower right corner of the screen, above each element. Dragging the little picture anywhere on the screen is also possible. The video is still visible when you navigate to other web tabs or applications.  
Click this button again to exit Picture in Picture mode.

We will test your solution in the latest version of Google Chrome.

### B2: Follow the cursor (Medium)

Place a circle at the center of the screen. The circle should have a white background and a black 1px border.

There is a line coming out of the circle. One end of the line is always attached to the center of the circle. The other end of the line follows the user's cursor. So basically the user's cursor and the center of the circle is always connected with this line.

Please see the video example.

### B3: Drawing Tool (Hard)

Create a 300px\*300px canvas centered on the screen. The user should be able to draw on the canvas with black. The canvas should have a slight border, so the user knows where the canvas is.

Create an export button below the canvas. Clicking this button will export and download the drawn image in PNG format named `drawing.png`. The button does not need to be styled.

Note that the exported drawing should have a white background so that the user's drawing is clearly visible.

### C1: Top courses (Easy)

You are given a list of course enrollments. Implement a function `getTopCourses(enrollments, topN)` that returns the top N courses based on the number of enrollments. The function should return an array of course names and enrollment counts sorted by enrollment count in descending order.

Please see the [/assets/module-b/c1/index.js](/assets/module-b/c1/index.js) file.

### C2: Array chunking (Medium)

Implement a function `chunkArray(array, chunkSize)` that takes an array and a chunk size as arguments and returns a new array where the original array is divided into subarrays of the specified chunk size. The last chunk may contain fewer elements if the total number of elements in the original array is not perfectly divisible by the chunk size.

Please see the [/assets/module-b/c2/index.js](/assets/module-b/c2/index.js) file.

### C3: Two numbers that add up (Hard)

You get a list of **numbers** (they may be negative) and a **target** number.

Find **two different positions** in the list such that the values at those positions **add up to the target**. Return those two positions as `[i, j]`, with `i < j`.

You may assume there is **exactly one** correct pair.

Please see the [/assets/module-b/c3/index.js](/assets/module-b/c3/index.js) file.
