resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = var.alarm_name
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggers when CPU usage stays above 80 percent"

  dimensions = {
    InstanceId = var.instance_id
  }
}