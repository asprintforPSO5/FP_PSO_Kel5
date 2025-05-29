provider "azurerm" {
  features {}
  # Credentials akan diambil dari environment variables yang diset di GitHub Actions (AZURE_CLIENT_ID, dll.)
}

# Resource Group Utama
resource "azurerm_resource_group" "rg" {
  name     = "rg-tastyrecipes-${var.environment}"
  location = var.location
  tags = {
    environment = var.environment
    project     = "Tasty Recipes"
  }
}

# Azure Container Registry (ACR) - jika belum ada atau ingin dikelola Terraform
resource "azurerm_container_registry" "acr" {
  name                = "acrtastyrecipes${var.environment}" # Nama harus unik global
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic" # Atau Standard/Premium
  admin_enabled       = true    # Atau false dan gunakan Service Principal untuk auth
  tags = {
    environment = var.environment
  }
}

# App Service Plan
resource "azurerm_service_plan" "appserviceplan" {
  name                = "asp-tastyrecipes-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1" # Basic tier, sesuaikan kebutuhan
  tags = {
    environment = var.environment
  }
}

# App Service for Containers (Linux)
resource "azurerm_linux_web_app" "appservice" {
  name                = "app-tastyrecipes-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.appserviceplan.id

  site_config {
    always_on = false # Untuk tier B1 (Basic), false untuk hemat biaya.
    application_stack {
      docker_image_name = "${azurerm_container_registry.acr.login_server}/tastyrecipes:${var.docker_image_tag}"
      # Jika pakai GHCR atau Docker Hub:
      # docker_image_name = "ghcr.io/your_owner/tastyrecipes:${var.docker_image_tag}"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    environment = var.environment
  }
}

output "app_service_default_hostname" {
  description = "The default hostname of the deployed App Service."
  value       = azurerm_linux_web_app.appservice.default_hostname # Contoh, tergantung resource Anda
}

output "resource_group_name" {
  description = "The name of the main resource group."
  value       = azurerm_resource_group.rg.name # Contoh
}

# Sebaiknya ini ada di file versions.tf
terraform {
  required_version = ">= 1.3.0, < 1.6.0" # Contoh rentang versi Terraform

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.60" # Contoh versi provider AzureRM, sesuaikan dengan yang terbaru stabil
    }
  }
}