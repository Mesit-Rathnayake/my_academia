import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import '../../models/module_model.dart';
import '../../providers/academic_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/add_edit_module_dialog.dart';
import 'module_detail_screen.dart';

class ModulesScreen extends StatefulWidget {
  const ModulesScreen({super.key});

  @override
  State<ModulesScreen> createState() => _ModulesScreenState();
}

class _ModulesScreenState extends State<ModulesScreen> {
  int _selectedSemesterFilter = 0; // 0 = All

  Color _getAttendanceColor(double percentage) {
    if (percentage >= 80) return AppTheme.success;
    if (percentage >= 70) return AppTheme.warning;
    return AppTheme.danger;
  }

  @override
  Widget build(BuildContext context) {
    final academic = Provider.of<AcademicProvider>(context);
    final modules = academic.modules;

    final filteredModules = _selectedSemesterFilter == 0
        ? modules
        : modules.where((m) => m.semester == _selectedSemesterFilter).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('My Modules'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppTheme.primary, size: 28),
            onPressed: () {
              showDialog(
                context: context,
                builder: (_) => const AddEditModuleDialog(),
              );
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Container(
            color: AppTheme.card,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  ChoiceChip(
                    label: const Text('All Semesters'),
                    selected: _selectedSemesterFilter == 0,
                    onSelected: (_) => setState(() => _selectedSemesterFilter = 0),
                    selectedColor: AppTheme.primary,
                    labelStyle: TextStyle(
                      color: _selectedSemesterFilter == 0 ? Colors.white : AppTheme.textSecondary,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    side: BorderSide.none,
                  ),
                  ...List.generate(8, (i) => i + 1).map((sem) {
                    final isSelected = _selectedSemesterFilter == sem;
                    return Padding(
                      padding: const EdgeInsets.only(left: 6),
                      child: ChoiceChip(
                        label: Text('Sem $sem'),
                        selected: isSelected,
                        onSelected: (_) => setState(() => _selectedSemesterFilter = sem),
                        selectedColor: AppTheme.primary,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppTheme.textSecondary,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        side: BorderSide.none,
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => academic.fetchDashboardData(),
        child: filteredModules.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.menu_book_outlined, size: 48, color: AppTheme.textMuted),
                    const SizedBox(height: 12),
                    const Text('No modules registered', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    const Text('Tap the + button above to add a module', style: TextStyle(color: AppTheme.textSecondary)),
                  ],
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: filteredModules.length,
                itemBuilder: (context, idx) {
                  final m = filteredModules[idx];
                  final attendance = m.attendancePercentage;
                  final attColor = _getAttendanceColor(attendance);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.cardBorder),
                    ),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => ModuleDetailScreen(module: m)),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Attendance Progress Ring
                                CircularPercentIndicator(
                                  radius: 28.0,
                                  lineWidth: 5.0,
                                  percent: (attendance / 100).clamp(0.0, 1.0),
                                  center: Text(
                                    '${attendance.toInt()}%',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: attColor),
                                  ),
                                  progressColor: attColor,
                                  backgroundColor: attColor.withOpacity(0.15),
                                  circularStrokeCap: CircularStrokeCap.round,
                                ),
                                const SizedBox(width: 14),

                                // Module Info
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppTheme.primaryLight,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              m.moduleCode,
                                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppTheme.primary),
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppTheme.cardMuted,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              'Sem ${m.semester}',
                                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        m.moduleName,
                                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${m.credits} Credits • Attended ${m.attendedLectures}/${m.conductedLectures} lectures',
                                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.chevron_right, color: AppTheme.textMuted),
                              ],
                            ),

                            // Footer Badges (Assignments & Labs)
                            if (m.assignments.isNotEmpty || m.labs.isNotEmpty) ...[
                              const Divider(height: 20, color: AppTheme.cardBorder),
                              Row(
                                children: [
                                  if (m.assignments.isNotEmpty)
                                    Row(
                                      children: [
                                        const Icon(Icons.assignment_outlined, size: 14, color: AppTheme.primary),
                                        const SizedBox(width: 4),
                                        Text(
                                          '${m.assignments.where((a) => a.status == 'Submitted').length}/${m.assignments.length} Assignments',
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
                                        ),
                                      ],
                                    ),
                                  const Spacer(),
                                  if (m.labs.isNotEmpty)
                                    Row(
                                      children: [
                                        const Icon(Icons.science_outlined, size: 14, color: AppTheme.secondary),
                                        const SizedBox(width: 4),
                                        Text(
                                          '${m.labs.where((l) => l.status == 'Conducted').length}/${m.labs.length} Labs',
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
                                        ),
                                      ],
                                    ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primary,
        onPressed: () {
          showDialog(context: context, builder: (_) => const AddEditModuleDialog());
        },
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Module', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
