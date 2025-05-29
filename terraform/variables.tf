# terraform/variables.tf

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "location" {
  description = "The Azure region where resources will be deployed."
  type        = string
  default     = "Southeast Asia" 
}

variable "docker_image_tag" {
  description = "The tag of the Docker image to deploy (e.g., git commit SHA)."
  type        = string
  default     = "latest" 
}

# (Opsional) Jika Anda mengelola Firebase config via App Settings
# variable "firebase_api_key" {
#   description = "Firebase API Key for the application."
#   type        = string
#   sensitive   = true # Agar tidak ditampilkan di log
# }