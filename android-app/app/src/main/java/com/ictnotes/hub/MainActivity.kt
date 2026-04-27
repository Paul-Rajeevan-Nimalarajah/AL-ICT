package com.ictnotes.hub

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    // Default GitHub Pages URL placeholder
    // Replace with ACTUAL GitHub pages URL e.g., "https://yourusername.github.io/ict-notes/"
    private val TARGET_URL = "https://alict.paulrajeevan.com"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        setupWebView()
        webView.loadUrl(TARGET_URL)
        checkForUpdates()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Essential WebSettings for loading complex sites and PWAs
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        // Cache Management: Fetch from network when online, use cache when offline
        if (isNetworkAvailable()) {
            settings.cacheMode = WebSettings.LOAD_DEFAULT
        } else {
            settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        // Use WebClient to handle loading rules
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: android.webkit.WebResourceRequest?): Boolean {
                val url = request?.url ?: return false
                val scheme = url.scheme ?: ""
                val host = url.host ?: ""
                
                // Let WebView handle our own domain
                if ((scheme == "http" || scheme == "https") && host.endsWith("alict.paulrajeevan.com")) {
                    return false
                }
                
                // Also let WebView handle data: and blob: URLs if needed
                if (scheme == "data" || scheme == "blob") {
                    return false
                }
                
                // Everything else (external domains, mailto, tel, tg, etc.) goes to external apps
                return try {
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, url)
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    false
                }
            }

            @Deprecated("Deprecated in Java", ReplaceWith("shouldOverrideUrlLoading(view, request)"))
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url == null) return false
                val uri = android.net.Uri.parse(url)
                val scheme = uri.scheme ?: ""
                val host = uri.host ?: ""
                
                if ((scheme == "http" || scheme == "https") && host.endsWith("alict.paulrajeevan.com")) {
                    return false
                }
                if (scheme == "data" || scheme == "blob") {
                    return false
                }
                
                return try {
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, uri)
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    false
                }
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    val failingUrl = request.url.toString()
                    showOfflinePage(view, failingUrl)
                }
            }

            @Deprecated("Deprecated in Java", ReplaceWith("onReceivedError(view, request, error)"))
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                showOfflinePage(view, failingUrl ?: TARGET_URL)
            }
        }

        // Handle JS dialogs and progress updates
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress == 100) {
                    progressBar.visibility = View.GONE
                } else {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                }
            }
        }

        // Handle file downloads
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val request = android.app.DownloadManager.Request(android.net.Uri.parse(url))
                request.setMimeType(mimetype)
                request.addRequestHeader("User-Agent", userAgent)
                
                // Set cookies if available
                val cookies = android.webkit.CookieManager.getInstance().getCookie(url)
                if (cookies != null) {
                    request.addRequestHeader("cookie", cookies)
                }
                
                request.setDescription("Downloading file...")
                val fileName = android.webkit.URLUtil.guessFileName(url, contentDisposition, mimetype)
                request.setTitle(fileName)
                
                // Show notification during and after download
                request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                request.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, fileName)
                
                val dm = getSystemService(android.content.Context.DOWNLOAD_SERVICE) as android.app.DownloadManager
                dm.enqueue(request)
                
                android.widget.Toast.makeText(applicationContext, "Downloading File: $fileName", android.widget.Toast.LENGTH_LONG).show()
            } catch (e: Exception) {
                android.widget.Toast.makeText(applicationContext, "Error downloading file", android.widget.Toast.LENGTH_LONG).show()
            }
        }
    }

    // Handle physical hardware back button to navigate WebView history 
    // instead of closing the app immediately
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    private fun showOfflinePage(view: WebView?, failingUrl: String) {
        val htmlData = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb; color: #1f2937; text-align: center; padding: 20px; box-sizing: border-box; }
                    .icon { font-size: 64px; margin-bottom: 16px; color: #9ca3af; }
                    h1 { font-size: 24px; margin-bottom: 8px; }
                    p { font-size: 16px; color: #6b7280; margin-bottom: 24px; line-height: 1.5; }
                    .btn { background-color: #8D153A; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600; outline: none; }
                    .btn:active { background-color: #630C26; }
                </style>
            </head>
            <body>
                <div class="icon">📡</div>
                <h1>No Internet Connection</h1>
                <p>It looks like you're offline. Please check your network connection and try again.</p>
                <button onclick="window.location.reload();" class="btn">Retry Connection</button>
            </body>
            </html>
        """.trimIndent()
        view?.loadDataWithBaseURL(failingUrl, htmlData, "text/html", "UTF-8", failingUrl)
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val activeNetwork = connectivityManager.getNetworkCapabilities(network) ?: return false
        return when {
            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> true
            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> true
            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> true
            else -> false
        }
    }

    private fun checkForUpdates() {
        thread {
            try {
                val url = URL("https://alict.paulrajeevan.com/version.json")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connect()

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val content = connection.inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(content)
                    val latestVersion = json.getString("latestVersion")
                    val latestVersionCode = json.getInt("latestVersionCode")
                    val downloadUrl = json.getString("url")
                    val releaseNotes = json.optString("releaseNotes", "New version available!")

                    // Get current version
                    val packageInfo = packageManager.getPackageInfo(packageName, 0)
                    val currentVersionCode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                        packageInfo.longVersionCode.toInt()
                    } else {
                        @Suppress("DEPRECATION")
                        packageInfo.versionCode
                    }

                    if (latestVersionCode > currentVersionCode) {
                        runOnUiThread {
                            showUpdateDialog(latestVersion, downloadUrl, releaseNotes)
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun showUpdateDialog(version: String, downloadUrl: String, notes: String) {
        AlertDialog.Builder(this)
            .setTitle("Update Available ($version)")
            .setMessage(notes)
            .setPositiveButton("Update Now") { _, _ ->
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl))
                startActivity(intent)
            }
            .setNegativeButton("Later", null)
            .setCancelable(true)
            .show()
    }
}
