import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import linregress

dataset_LST = r"C:\Users\skard\OneDrive\Desktop\LST.csv"
dataset_NDVI = r"C:\Users\skard\OneDrive\Desktop\NDVI.csv"

LST_data = pd.read_csv(dataset_LST)
NDVI_data = pd.read_csv(dataset_NDVI)

#print(LST_data.head())
#print(NDVI_data.head())

LST_data['endDate'] = pd.to_datetime(LST_data['endDate'])
NDVI_data['endDate'] = pd.to_datetime(NDVI_data['endDate'])

LST_data_year_filtered = LST_data[LST_data['endDate'].dt.year == 2020]
NDVI_data_year_filtered = NDVI_data[NDVI_data['endDate'].dt.year == 2020]

LST_data_year_filtered = LST_data_year_filtered.sort_values(by='ZBEZ').reset_index(drop=True)
NDVI_data_year_filtered = NDVI_data_year_filtered.sort_values(by='ZBEZ').reset_index(drop=True)

plt.figure(figsize=(10, 6))
plt.scatter(NDVI_data_year_filtered['NDVI'], LST_data_year_filtered['LST_Celsius'], alpha=1)
plt.title('2020: Land Surface Temperature vs. Normalized Difference Vegetation Index')
plt.xlabel('NDVI')
plt.ylabel('LST (in Celsius)')
plt.grid(True)
plt.show()