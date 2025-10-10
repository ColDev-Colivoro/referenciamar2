"use client"

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/app/AuthContext';
import axios from 'axios';

interface CompanyData {
  id: number;
  name: string;
  active_users_total: number;
  active_users_managers: number;
  active_users_quality_managers: number;
  active_users_monitors: number;
  quality_compliance: number;
  forms_completed: number;
  // Add other fields as necessary based on your Django Company model
}

export function CompanyManagement() {
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const { token } = useAuth();

  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompaniesData = async () => {
    if (!token) {
      setLoading(false);
      setError("Authentication token not available.");
      return;
    }
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/companies/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setCompanies(response.data);
    } catch (err) {
      console.error("Failed to fetch companies data:", err);
      setError("Failed to load companies data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompaniesData();
  }, [token]);

  if (loading) {
    return (
      <Card style={[styles.card, { backgroundColor: background }]}>
        <CardContent style={styles.cardContent}>
          <ThemedText>Cargando datos de empresas...</ThemedText>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.card, { backgroundColor: background }]}>
        <CardContent style={styles.cardContent}>
          <ThemedText style={{ color: 'red' }}>Error: {error}</ThemedText>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: background }]}>
      <CardHeader style={styles.cardHeader}>
        <CardTitle style={styles.cardTitle}>
          <IconSymbol name="building.2.fill" size={20} color="#800080" style={styles.titleIcon} />
          Gestión por Empresa
        </CardTitle>
      </CardHeader>
      <CardContent style={styles.cardContent}>
        {companies.length > 0 ? (
          <Tabs defaultValue={companies[0]?.id.toString()} className="w-full">
            <TabsList style={styles.tabsList}>
              {companies.map((company) => (
                <TabsTrigger
                  key={company.id}
                  value={company.id.toString()}
                  style={styles.tabsTrigger}
                >
                  {company.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {companies.map((company) => (
              <TabsContent key={company.id} value={company.id.toString()} style={styles.tabsContent}>
                {/* Métricas de la Empresa */}
                <View style={styles.metricsGrid}>
                  <View style={[styles.metricItem, { backgroundColor: '#E0F2F7', borderColor: '#B3E0F2' }]}>
                    <IconSymbol name="person.2.fill" size={24} color="#007AFF" style={styles.metricIcon} />
                    <ThemedText style={[styles.metricValue, { color: '#007AFF' }]}>{company.active_users_total}</ThemedText>
                    <ThemedText style={styles.metricLabel}>Usuarios Activos</ThemedText>
                    <View style={styles.subMetrics}>
                      <ThemedText style={styles.subMetricText}>• {company.active_users_managers} Gerentes</ThemedText>
                      <ThemedText style={styles.subMetricText}>• {company.active_users_quality_managers} Jefes Calidad</ThemedText>
                      <ThemedText style={styles.subMetricText}>• {company.active_users_monitors} Monitores</ThemedText>
                    </View>
                  </View>
                  <View style={[styles.metricItem, { backgroundColor: '#D4EDDA', borderColor: '#A3D9B3' }]}>
                    <IconSymbol name="cube.box.fill" size={24} color="#28A745" style={styles.metricIcon} />
                    <ThemedText style={[styles.metricValue, { color: '#28A745' }]}>{company.forms_completed}</ThemedText>
                    <ThemedText style={styles.metricLabel}>Planillas Completadas</ThemedText>
                    {/* Placeholder for products, as it's not directly in Django Company model */}
                    <View style={styles.subMetrics}>
                      <ThemedText style={styles.subMetricText}>• N/A Pescados</ThemedText>
                      <ThemedText style={styles.subMetricText}>• N/A Mariscos</ThemedText>
                      <ThemedText style={styles.subMetricText}>• N/A Cefalópodos</ThemedText>
                    </View>
                  </View>
                </View>

                {/* Procesos Activos - Placeholder */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Procesos Activos</ThemedText>
                  <View style={styles.processItem}>
                    <ThemedText style={styles.processName}>Proceso de Congelado</ThemedText>
                    <Badge variant="default" style={{ backgroundColor: '#007AFF', borderColor: '#007AFF' }}><ThemedText style={{ color: 'white', fontSize: 12 }}>Congelado</ThemedText></Badge>
                  </View>
                  <View style={styles.processItem}>
                    <ThemedText style={styles.processName}>Inspección de Calidad</ThemedText>
                    <Badge variant="default" style={{ backgroundColor: '#28A745', borderColor: '#28A745' }}><ThemedText style={{ color: 'white', fontSize: 12 }}>Enfriado</ThemedText></Badge>
                  </View>
                </View>

                {/* Métricas de Calidad y Formulario */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Rendimiento de Calidad</ThemedText>
                  <View style={styles.progressItem}>
                    <View style={styles.progressTextContainer}>
                      <ThemedText style={styles.progressLabelText}>Cumplimiento de Calidad</ThemedText>
                      <ThemedText style={styles.progressValueText}>{company.quality_compliance}%</ThemedText>
                    </View>
                    <Progress value={company.quality_compliance} style={styles.progressBar} />
                  </View>
                  <View style={styles.progressItem}>
                    <View style={styles.progressTextContainer}>
                      <ThemedText style={styles.progressLabelText}>Planillas Completadas</ThemedText>
                      <ThemedText style={styles.progressValueText}>{company.forms_completed}</ThemedText>
                    </View>
                    <Progress value={(company.forms_completed / 2000) * 100} style={[styles.progressBar, { backgroundColor: '#007AFF' }]} />
                  </View>
                </View>

                <View style={[styles.infoBox, { backgroundColor: tintColor + '11', borderColor: tintColor + '33' }]}>
                  <ThemedText style={[styles.infoBoxTitle, { color: tintColor }]}>Información de la Empresa</ThemedText>
                  <ThemedText style={[styles.infoBoxText, { color: text }]}>
                    Esta sección muestra un resumen detallado de la operación de{" "}
                    <ThemedText style={{ fontWeight: 'bold' }}>{company.name}</ThemedText>.
                  </ThemedText>
                </View>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <ThemedText>No hay empresas disponibles para gestionar.</ThemedText>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 20,
  },
  cardHeader: {
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#800080', // Purple-600 equivalent
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    marginRight: 8,
  },
  cardContent: {
    paddingTop: 0,
  },
  tabsList: {
    marginBottom: 20,
    backgroundColor: '#E0E0E0', // Gray-100 equivalent
    borderRadius: 8,
    padding: 4,
  },
  tabsTrigger: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: '600',
    color: 'gray',
  },
  tabsContent: {
    paddingTop: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  metricItem: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  subMetrics: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  subMetricText: {
    fontSize: 12,
    color: 'gray',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  processItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F0F0', // Gray-50 equivalent
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Gray-200 equivalent
    marginBottom: 8,
  },
  processName: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressItem: {
    marginBottom: 12,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabelText: {
    fontSize: 14,
  },
  progressValueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 12,
  },
});
