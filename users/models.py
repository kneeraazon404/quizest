from django.db import models

# Create your models here.
class ExcelFile(models.Model):
    excel_file = models.FileField(upload_to="zippedFiles/")

    def __str__(self):
        return self.name
