import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/academic_provider.dart';
import '../theme/app_theme.dart';
import 'home/home_screen.dart';
import 'modules/modules_screen.dart';
import 'schedule/schedule_screen.dart';
import 'ai_tutor/ai_tutor_screen.dart';
import 'performance/performance_screen.dart';
import 'profile/profile_screen.dart';

class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    ModulesScreen(),
    ScheduleScreen(),
    AiTutorScreen(),
    PerformanceScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AcademicProvider>(context, listen: false).fetchDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.card,
          border: Border(top: BorderSide(color: AppTheme.cardBorder, width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (index) => setState(() => _currentIndex = index),
          backgroundColor: AppTheme.card,
          indicatorColor: AppTheme.primaryLight,
          elevation: 0,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.grid_view_outlined, color: AppTheme.textSecondary),
              selectedIcon: Icon(Icons.grid_view_rounded, color: AppTheme.primary),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.menu_book_outlined, color: AppTheme.textSecondary),
              selectedIcon: Icon(Icons.menu_book_rounded, color: AppTheme.primary),
              label: 'Modules',
            ),
            NavigationDestination(
              icon: Icon(Icons.calendar_today_outlined, color: AppTheme.textSecondary),
              selectedIcon: Icon(Icons.calendar_today, color: AppTheme.primary),
              label: 'Schedule',
            ),
            NavigationDestination(
              icon: Icon(Icons.smart_toy_outlined, color: AppTheme.textSecondary),
              selectedIcon: Icon(Icons.smart_toy_rounded, color: AppTheme.primary),
              label: 'AI Tutor',
            ),
            NavigationDestination(
              icon: Icon(Icons.trending_up_outlined, color: AppTheme.textSecondary),
              selectedIcon: Icon(Icons.trending_up, color: AppTheme.primary),
              label: 'GPA',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline, color: AppTheme.textSecondary),
              selectedIcon: Icon(Icons.person, color: AppTheme.primary),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
