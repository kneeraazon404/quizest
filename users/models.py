from django.db import models

# Create your models here.
class ExcelFile(models.Model):
    name = models.CharField(max_length=100, default="pnpfiles.zip")
    excel_file = models.FileField(upload_to="zippedFiles/")

    def __str__(self):
        return self.name
