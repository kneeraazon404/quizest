from django.db import models

# Create your models here.
class ExcelFile(models.Model):
    name = models.CharField(max_length=100)
    excel_file = models.FileField(upload_to="excel_files/")

    def __str__(self):
        return self.name
