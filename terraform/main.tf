module "networking" {
  source = "./modules/networking"

  vpc_name    = "dream-vpc"
  vpc_cidr    = "10.0.0.0/16"
  subnet_name = "dream-subnet"
  subnet_cidr = "10.0.1.0/24"
  igw_name    = "dream-igw"
  rt_name     = "dream-rt"
}

module "ec2" {
  source = "./modules/ec2"

  instance_name  = "dream-app-server"
  instance_type  = "t3.micro"
  sg_name        = "dream-sg"
  vpc_id         = module.networking.vpc_id
  subnet_id      = module.networking.subnet_id
  ssh_public_key = var.ssh_public_key
}

module "cloudwatch" {
  source = "./modules/cloudwatch"

  alarm_name  = "dream-app-high-cpu"
  instance_id = module.ec2.instance_id
}

# infrastructure managed by terraform modules