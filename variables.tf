# ---------------------------------------------------------------------------------------------------------------------
# REQUIRED PARAMETERS
# These variables are expected to be passed in by the operator when calling this terraform module
# ---------------------------------------------------------------------------------------------------------------------

variable "name" {
  description = "The name of the MQ broker."
  type        = string
}

variable "engine_type" {
  description = "Type of broker engine, `ActiveMQ` or `RabbitMQ`"
  type        = string
}

variable "engine_version" {
  description = "The version of the broker engine. See https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/broker-engine.html for more details"
  type        = string
}

variable "storage_type" {
  description = "Storage type of the broker. For `engine_type` `ActiveMQ`, valid values are `efs` and `ebs` (AWS-default is `efs`). For `engine_type` `RabbitMQ`, only `ebs` is supported. When using `ebs`, only the `mq.m5` broker instance type family is supported."
  type        = string
}

variable "host_instance_type" {
  description = "The broker's instance type. e.g. `mq.t3.micro` or `mq.m5.large`"
  type        = string
}

variable "username" {
  description = "The username for the MQ broker admin user."
  default     = "admin"
  type        = string
}

variable "password" {
  description = "The password for the MQ broker admin user."
  type        = string
}

variable "deployment_mode" {
  description = "Deployment mode of the broker. Valid values are `SINGLE_INSTANCE`, `ACTIVE_STANDBY_MULTI_AZ`, and `CLUSTER_MULTI_AZ`."
  type        = string
  default     = "SINGLE_INSTANCE"
}

variable "apply_immediately" {
  description = "Whether to apply broker modifications immediately."
  type        = bool
  default     = false
}

variable "auto_minor_version_upgrade" {
  description = "Whether to automatically upgrade to new minor versions of brokers as Amazon MQ makes releases available."
  type        = bool
  default     = false
}

variable "maintenance_window_start_time" {
  description = " Configuration block for the maintenance window start time."
  type        = string
  default     = "Sun:00:00"
}

variable "publicly_accessible" {
  description = "Whether to enable connections from applications outside of the VPC that hosts the broker's subnets."
  type        = bool
  default     = false
}

variable "region" {
  description = "The AWS region to create broker in."
  type        = string
  default     = "ap-south-1"
}

variable "broker_security_group_name" {
  description = "The name of the aws_broker_security_group that is created. Defaults to var.name if not specified."
  type = string
  default     = null
}

variable "broker_security_group_description" {
  description = "The description of the aws_broker_security_group that is created. Defaults to 'Security group for the var.name broker' if not specified."
  type        = string
  default     = null
}

variable "vpc_id" {
  description = "The id of the VPC in which this Broker should be deployed."
  type        = string
}

variable "custom_tags" {
  description = "A map of custom tags to apply to the Broker and the Security Group created for it. The key is the tag name and the value is the tag value."
  type        = map(string)
  default     = {}
}

variable "allow_connections_from_cidr_blocks" {
  description = "A list of CIDR-formatted IP address ranges that can connect to this Broker. Should typically be the CIDR blocks of the private app subnet in this VPC plus the private subnet in the mgmt VPC."
  type        = list(string)
  default     = []
}

variable "allow_outbound_connections_to_cidr_blocks" {
  description = "A list of CIDR-formatted IP address ranges that the database is allowed to send traffit to. Should typically be the CIDR blocks of the private app subnet in this VPC plus the private subnet in the mgmt VPC."
  type        = list(string)
  default     = []
}

variable "allow_connections_from_security_groups" {
  description = "A list of Security Groups that can connect to this Broker."
  type        = list(string)
  default     = []
}

variable "authentication_strategy" {
  description = "Authentication strategy used to secure the broker. Valid values are `simple` and `ldap`. `ldap` is not supported for `engine_type` `RabbitMQ`."
  type        = string
  default     = "simple"
}
