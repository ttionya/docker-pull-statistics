variable "VERSION" {
  default = "latest"
}

target "docker-metadata-action" {}

target "_common" {
  inherits = ["docker-metadata-action"]
  context = "."
  dockerfile = "Dockerfile"
}

target "_common_multi_platforms" {
  platforms = [
    "linux/amd64",
    "linux/arm64",
    "linux/arm/v6",
    "linux/arm/v7"
  ]
}

target "_common_tags" {
  tags = [
    "ttionya/docker-pull-statistics:latest",
    "ttionya/docker-pull-statistics:${VERSION}",
    "ghcr.io/ttionya/docker-pull-statistics:latest",
    "ghcr.io/ttionya/docker-pull-statistics:${VERSION}"
  ]
}

target "image-stable" {
  inherits = ["_common", "_common_multi_platforms", "_common_tags"]
}

target "image-beta" {
  inherits = ["_common", "_common_multi_platforms"]
  tags = [
    "ttionya/docker-pull-statistics:${VERSION}"
  ]
}

target "image-nightly" {
  inherits = ["_common", "_common_multi_platforms"]
  tags = [
    "ttionya/docker-pull-statistics:nightly"
  ]
}
