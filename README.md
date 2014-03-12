jarquee
=======

An old jQuery marquee plugin that's been updated over time.

Options
------
* **speed** {Integer) Scroll speed, roughly in characters-per-second based on a 20px average width. <br> Default is 5.
* **baseWidth** {Integer} Width used for the inner container to make sure the contained text is on one line before calculating the actual width. <br> Default is 5000.
* **delay** {Integer} Amount of time (in milliseconds) to wait before the banner starts scrolling. <br> Default is 500.
* **pause** {Boolean} Pause on hover. <br> Default is not set (false).
* **offset** {Integer} Distance in pixels from left edge to start the scrolling text. <br> Default is 50.
* **center** {Boolean} Whether to start with the marquee text centered. Only tested if text is shorter than the container. <br> Default is not set (false).
* **URL** {String} URL from which to fetch JSON data containing the marquee text. Format discussed below. <br> Default is empty string (no URL).
* **debug** {Boolean} Whether to display debug messages in the console. <br> Default is false.

Content JSON
------
Jarquee allows the loading of the scrolling marquee content from a JSON source. If the URL contains a unique ID for the content, the ID can be indicated on the URL with a double-hash (##) and specified as a "rel" attribute on the object against which jarquee is called.

### Example

```javascript
{
  "status_code": 0,
  "status_message": "",
  "data_object": [
    {
      "id": 1,
      "site_id": 1,
      "description": "This is the banner text."
    }
  ]
}
```
