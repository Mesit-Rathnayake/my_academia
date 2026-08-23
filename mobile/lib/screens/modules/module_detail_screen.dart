import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import '../../models/module_model.dart';
import '../../providers/academic_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/add_edit_module_dialog.dart';

class ModuleDetailScreen extends StatefulWidget {
  final ModuleModel module;

  const ModuleDetailScreen({super.key, required this.module});

  @override
  State<ModuleDetailScreen> createState() => _ModuleDetailScreenState();
}

class _ModuleDetailScreenState extends State<ModuleDetailScreen> {
  late int _attended;
  late int _conducted;

  @override
  void initState() {
    super.initState();
    _attended = widget.module.attendedLectures;
    _conducted = widget.module.conductedLectures;
  }

  Color _getAttendanceColor(double percentage) {
    if (percentage >= 80) return AppTheme.success;
    if (percentage >= 70) return AppTheme.warning;
    return AppTheme.danger;
  }

  void _updateAttendanceCounters(int newAttended, int newConducted) {
    if (newAttended < 0 || newConducted < 0 || newAttended > newConducted) return;

    setState(() {
      _attended = newAttended;
      _conducted = newConducted;
    });

    Provider.of<AcademicProvider>(context, listen: false).updateAttendance(
      widget.module.id,
      attended: _attended,
      conducted: _conducted,
    );
  }

  void _toggleAssignmentStatus(int index) {
    final assignments = List<AssignmentModel>.from(widget.module.assignments);
    final current = assignments[index];
    String nextStatus = 'Pending';
    if (current.status == 'Pending') nextStatus = 'Submitted';
    else if (current.status == 'Submitted') nextStatus = 'Graded';

    assignments[index] = AssignmentModel(
      id: current.id,
      title: current.title,
      status: nextStatus,
      dueDate: current.dueDate,
      marks: current.marks,
    );

    final updatedData = widget.module.toJson();
    updatedData['assignments'] = assignments.map((a) => a.toJson()).toList();

    Provider.of<AcademicProvider>(context, listen: false).updateModule(widget.module.id, updatedData);
  }

  void _toggleLabStatus(int index) {
    final labs = List<LabModel>.from(widget.module.labs);
    final current = labs[index];
    String nextStatus = 'Pending';
    if (current.status == 'Pending') nextStatus = 'Conducted';
    else if (current.status == 'Conducted') nextStatus = 'Graded';

    labs[index] = LabModel(
      id: current.id,
      title: current.title,
      status: nextStatus,
      dueDate: current.dueDate,
      marks: current.marks,
    );

    final updatedData = widget.module.toJson();
    updatedData['labs'] = labs.map((l) => l.toJson()).toList();

    Provider.of<AcademicProvider>(context, listen: false).updateModule(widget.module.id, updatedData);
  }

  void _confirmDelete() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Module', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Text('Are you sure you want to delete ${widget.module.moduleName}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () async {
              Navigator.pop(ctx);
              await Provider.of<AcademicProvider>(context, listen: false).deleteModule(widget.module.id);
              if (mounted) Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final academic = Provider.of<AcademicProvider>(context);
    // Find latest updated module object
    final currentMod = academic.modules.firstWhere(
      (m) => m.id == widget.module.id,
      orElse: () => widget.module,
    );

    final percentage = currentMod.attendancePercentage;
    final attColor = _getAttendanceColor(percentage);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(currentMod.moduleCode),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {
              showDialog(
                context: context,
                builder: (_) => AddEditModuleDialog(initialModule: currentMod),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppTheme.danger),
            onPressed: _confirmDelete,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Module Title Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'SEMESTER ${currentMod.semester}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppTheme.primary),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.cardMuted,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${currentMod.credits} CREDITS',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    currentMod.moduleName,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.textPrimary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Attendance Tracking Interactive Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'ATTENDANCE PROGRESS',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.textSecondary, letterSpacing: 0.5),
                      ),
                      Text(
                        '${percentage.toStringAsFixed(1)}%',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: attColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  LinearPercentIndicator(
                    padding: EdgeInsets.zero,
                    percent: (percentage / 100).clamp(0.0, 1.0),
                    lineHeight: 8,
                    barRadius: const Radius.circular(4),
                    progressColor: attColor,
                    backgroundColor: attColor.withOpacity(0.15),
                  ),
                  const SizedBox(height: 16),

                  // Stepper Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Attended Lectures', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                          const SizedBox(height: 4),
                          Text('$_attended / $_conducted', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        ],
                      ),
                      Row(
                        children: [
                          ElevatedButton.icon(
                            onPressed: () => _updateAttendanceCounters(_attended + 1, _conducted + 1),
                            icon: const Icon(Icons.add, size: 16, color: Colors.white),
                            label: const Text('Attended', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success, elevation: 0),
                          ),
                          const SizedBox(width: 8),
                          OutlinedButton.icon(
                            onPressed: () => _updateAttendanceCounters(_attended, _conducted + 1),
                            icon: const Icon(Icons.close, size: 16, color: AppTheme.danger),
                            label: const Text('Missed', style: TextStyle(color: AppTheme.danger, fontWeight: FontWeight.bold)),
                            style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFFECACA))),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Continuous Assessments Checklist
            const Text(
              'Continuous Assessments',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 8),

            if (currentMod.assignments.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: const Text('No assignments added.', style: TextStyle(color: AppTheme.textSecondary)),
              )
            else
              ...currentMod.assignments.asMap().entries.map((entry) {
                final idx = entry.key;
                final a = entry.value;
                final isDone = a.status == 'Submitted' || a.status == 'Graded';

                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.cardBorder),
                  ),
                  child: ListTile(
                    onTap: () => _toggleAssignmentStatus(idx),
                    leading: Icon(
                      isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                      color: isDone ? AppTheme.success : AppTheme.textMuted,
                    ),
                    title: Text(a.title, style: TextStyle(fontWeight: FontWeight.w700, decoration: isDone ? TextDecoration.lineThrough : null)),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDone ? AppTheme.successLight : AppTheme.warningLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        a.status,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: isDone ? AppTheme.success : AppTheme.warning,
                        ),
                      ),
                    ),
                  ),
                );
              }),

            const SizedBox(height: 20),

            // Labs Checklist
            const Text(
              'Practical Lab Sessions',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 8),

            if (currentMod.labs.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: const Text('No lab sessions listed.', style: TextStyle(color: AppTheme.textSecondary)),
              )
            else
              ...currentMod.labs.asMap().entries.map((entry) {
                final idx = entry.key;
                final l = entry.value;
                final isDone = l.status == 'Conducted' || l.status == 'Graded';

                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.cardBorder),
                  ),
                  child: ListTile(
                    onTap: () => _toggleLabStatus(idx),
                    leading: Icon(
                      isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                      color: isDone ? AppTheme.secondary : AppTheme.textMuted,
                    ),
                    title: Text(l.title, style: TextStyle(fontWeight: FontWeight.w700, decoration: isDone ? TextDecoration.lineThrough : null)),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDone ? const Color(0xFFE0F2FE) : AppTheme.warningLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        l.status,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: isDone ? AppTheme.secondary : AppTheme.warning,
                        ),
                      ),
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
