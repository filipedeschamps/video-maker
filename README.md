### Welcome to video maker

## What is it?
This project creates short videos by itself using artificial intelligence about the following topics:
- Who is Michael Jackson?
- History of Bacon
- What is Facebook?

## How does it work?
1. You input something
2. The bots start looking to the web to collect content
3. Find text in the wikipedia using algorithmia
4. Classify content extracting tags from wikipedia using watson
5. It looks for related images on google image
6. Build up the content with text, videos and song
7. Upload the content to youtube

## Install in your machine
1. Run `git clone https://github.com/filipedeschamps/video-maker` in your computer.
2. Register at algorithmia
3. Register at watson
4. Setup (copy and paste from the site) your algorithmia in `credentials/algorithmia.json`
5. Setup (copy and paste from the site) your watson in `credentials/watson-nlu.json`

## Run
`node index.js`

## Result
https://www.youtube.com/channel/UCX-Y90wbf76a8aINsxeBZew/videos


