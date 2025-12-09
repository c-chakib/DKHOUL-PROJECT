import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';
import { AdminService, DashboardStats } from '../../../core/services/admin.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    private adminService = inject(AdminService);

    stats = signal<DashboardStats | null>(null);
    loading = signal<boolean>(true);
    error = signal<string | null>(null);

    // Chart Data
    doughnutChartLabels: string[] = [];
    doughnutChartData: ChartData<'doughnut'> = {
        labels: [],
        datasets: [{ data: [] }]
    };
    doughnutChartType: ChartType = 'doughnut';

    ngOnInit() {
        this.fetchStats();
    }

    fetchStats() {
        this.adminService.getDashboardStats().subscribe({
            next: (res: any) => {
                this.stats.set(res.data);
                this.processChartData(res.data.categoryStats);
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error fetching admin stats:', err);
                this.error.set('Impossible de charger les statistiques.');
                this.loading.set(false);
            }
        });
    }

    processChartData(categoryStats: { _id: string; count: number }[]) {
        const labels = categoryStats.map(stat => stat._id);
        const data = categoryStats.map(stat => stat.count);

        // Colors: Terracotta (#E07A5F), Majorelle (#6050DC), Mint (#81B29A) - adjusted slightly for visibility
        const backgroundColors = ['#E07A5F', '#6050DC', '#81B29A', '#F2CC8F', '#3D405B'];

        this.doughnutChartLabels = labels;
        this.doughnutChartData = {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: backgroundColors.slice(0, data.length),
                    hoverBackgroundColor: backgroundColors.slice(0, data.length),
                    hoverOffset: 4
                }
            ]
        };
    }
}
