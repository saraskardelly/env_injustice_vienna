# In the following I created a scatterplot, to check for the relationship between Land Surface Temperature (LST) and the Normalized Difference Vegetation Index (NDVI)

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import linregress

# here, upload the datasets for NDVI and LST
dataset_LST =
dataset_NDVI = 
LST_data = pd.read_csv(dataset_LST)
NDVI_data = pd.read_csv(dataset_NDVI)
#print(LST_data.head())
#print(NDVI_data.head())

# this is not really necessary, but it is easier to work with it later, as some start and end dates differ each year
LST_data['endDate'] = pd.to_datetime(LST_data['endDate'])
NDVI_data['endDate'] = pd.to_datetime(NDVI_data['endDate'])
LST_data_year_filtered = LST_data[LST_data['endDate'].dt.year == 2020]
NDVI_data_year_filtered = NDVI_data[NDVI_data['endDate'].dt.year == 2020]

# the common identifiactor is the ZBEZ code in both datasets
LST_data_year_filtered = LST_data_year_filtered.sort_values(by='ZBEZ').reset_index(drop=True)
NDVI_data_year_filtered = NDVI_data_year_filtered.sort_values(by='ZBEZ').reset_index(drop=True)

plt.figure(figsize=(10, 6))
plt.scatter(NDVI_data_year_filtered['NDVI'], LST_data_year_filtered['LST_Celsius'], alpha=1)
plt.title('2020: Land Surface Temperature vs. Normalized Difference Vegetation Index')
plt.xlabel('NDVI')
plt.ylabel('LST (in Celsius)')
plt.grid(True)
plt.show()
