# terraform/main.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    # Backend configuration will be provided via init command
  }
}

# Variables
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "app_version" {
  description = "Application version/tag"
  type        = string
  default     = "latest"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-southeast2" # Jakarta region
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "firebase_api" {
  service = "firebase.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_project_service" "firestore_api" {
  service = "firestore.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_project_service" "identity_toolkit_api" {
  service = "identitytoolkit.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_project_service" "firebase_hosting_api" {
  service = "firebasehosting.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

# Firebase project initialization
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
  
  depends_on = [
    google_project_service.firebase_api,
  ]
}

# Firebase Web App
resource "google_firebase_web_app" "tasty_recipes" {
  provider     = google-beta
  project      = var.project_id
  display_name = "Tasty Recipes"
  
  depends_on = [google_firebase_project.default]
}

# Firebase Hosting Site
resource "google_firebase_hosting_site" "default" {
  provider = google-beta
  project  = var.project_id
  site_id  = var.project_id
  
  depends_on = [google_firebase_project.default]
}

# Firestore Database
resource "google_firestore_database" "default" {
  project                     = var.project_id
  name                       = "(default)"
  location_id                = var.region
  type                       = "FIRESTORE_NATIVE"
  concurrency_mode           = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"
  
  depends_on = [
    google_project_service.firestore_api,
  ]
}

# Firebase Authentication
resource "google_identity_platform_config" "auth" {
  project = var.project_id
  
  sign_in {
    allow_duplicate_emails = false
    
    email {
      enabled           = true
      password_required = true
    }
  }
  
  depends_on = [
    google_project_service.identity_toolkit_api,
  ]
}


# Outputs
output "firebase_config" {
  value = {
    api_key             = google_firebase_web_app.tasty_recipes.api_key_id
    auth_domain         = "${var.project_id}.firebaseapp.com"
    project_id          = var.project_id
    storage_bucket      = "${var.project_id}.appspot.com"
    app_id              = google_firebase_web_app.tasty_recipes.app_id
    hosting_url         = "https://${var.project_id}.web.app"
  }
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    project_id  = var.project_id
    app_version = var.app_version
    region      = var.region
    timestamp   = timestamp()
  }
}