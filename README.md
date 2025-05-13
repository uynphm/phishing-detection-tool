# 🛡️ PhishGuard – Phishing URL Detection System

PhishGuard is a real-time phishing URL detection tool built for users to quickly and easily check the safety of links. Using a combination of machine learning, feature-based analysis, and blacklist lookups, it flags potentially dangerous URLs and provides users with immediate feedback.

> Developed as a final project for CS166 – Information Security at San José State University, Spring 2025.

---

## 🚀 Features

* **Phishing Detection** using fine-tuned BERT model
* **URL Analysis** based on structure, SSL status, and domain patterns
* **Google Safe Browsing API** integration for blacklist checking
* **Scan History** with timestamped results saved in local database
* **Modern Frontend** built with React and Tailwind CSS
* **Real-Time Feedback** – get instant results after scanning

---

## 🏗️ Project Architecture

**Frontend:**

* Built with **React** and **Tailwind CSS**
* Users can input URLs or scan QR codes
* Displays results in real-time with clear safe/unsafe indicators

**Backend:**

* Developed with **Flask**
* Uses **TensorFlow** to fine-tune and serve a pre-trained **BERT** model
* Integrates with **Google Safe Browsing API**
* Stores scan history using **SQLite3**

---

## 🧠 Machine Learning Model

* Originally planned to use Scikit-learn, but due to time constraints and data limitations, we pivoted to a **pre-trained BERT model**
* Fine-tuned using a phishing URL dataset from Kaggle
* Model classifies URLs as *phishing* or *legitimate* based on learned patterns

---

## 📦 Installation

> Requires Python 3.8+, Node.js, and pip

### 1. Clone the repo

```bash
git clone https://github.com/your-username/phishguard.git
cd phishguard
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm start
```

---

## 🧪 Sample Usage

1. Enter a URL in the input field.
2. Click **"Scan"**.
3. Get an instant verdict: `Safe ✅` or `Unsafe ❌`.
4. Visit the **Scan History** page to review past results.

---

## 📌 Known Issues

* Some false positives/negatives due to limited dataset
* Google Safe Browsing API occasionally misses newer threats
* Currently using local SQLite database – not optimized for large-scale usage

---

## 📈 Future Improvements

* Create a browser extension for real-time link warnings
* Train and evaluate custom Scikit-learn models for comparison
* Replace SQLite with PostgreSQL or MongoDB for scalability
* Dockerize the backend for easier deployment

---

## 👨‍💻 Contributors

* **Han Ngo** – Backend, API Integration, Data Processing
* **Kundyz Serzhankyzy** – Frontend Development, UI Design
* **Uyen Pham** – Machine Learning, Data Analysis, Frontend Integration

---
