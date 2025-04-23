# Tehran Region Locator

A Python Flask web application that accepts an address in Tehran, Iran, finds its geographical location on the map, and checks which polygonal region (administrative or custom region) the address belongs to. The app uses the [Neshan Map API](https://platform.neshan.org/apis/) for address to coordinates conversion and region matching.

## 📦 Project Structure
```bash
.
├── app.py
├── .env
├── static/
│   └── style.css
└── templates/
    └── index.html
```

## 🚀 Features

- Enter an address in Tehran and get its exact location on a map.
- Check if the address falls inside any predefined polygonal region (districts or custom zones).
- Displays results in a user-friendly interface.
- Uses Neshan Map Matching API for reliable geolocation.

## 🛠️ Installation & Setup

1. Clone the Repository

  ```bash

  git clone git@github.com:sinaaasghari/debugging-for-therapy.git
  cd debugging-for-therapy/tehran-region-locator
  ```

2. Gwt an API key
   
   Sign up at [Neshan Map Platform](https://platform.neshan.org/apis/) and obtain your API Key for the Map Matching API.'

3.Configure Environment Variables

  Copy your API Key into a .env file at the root of the project:
  ```bash
  NESHAN_API_KEY=YOUR_API_KEY_HERE
  ```
## 🏃 Usage

  1. Run the Application: 

  ```bash
flask run
```

  2. Open your browser and navigate to http://127.0.0.1:5000/.

  3. Enter a Tehran address and press the button.

  4. View result: The application determines and displays whether the address lies within a predefined region.


## 🤝 Contribution

Pull requests, bug fixes, and feature requests are welcome! Please open an issue to discuss before submitting a PR.


## 📫 Contact

If you have any questions or feedback, feel free to reach out via GitHub or email me directly.


Email : sinaof1381@gmail.com







