import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/academic_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/add_class_dialog.dart';
import '../../widgets/add_exam_series_dialog.dart';
import 'package:intl/intl.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  int _selectedDay = 0; // 0 = Mon ... 6 = Sun
  int _tabIndex = 0; // 0 = Classes, 1 = Exams

  final List<String> _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  void initState() {
    super.initState();
    final weekday = DateTime.now().weekday;
    _selectedDay = weekday == 7 ? 6 : weekday - 1;
  }

  void _showAddDialog() {
    if (_tabIndex == 0) {
      showDialog(
        context: context,
        builder: (_) => AddClassDialog(initialDay: _selectedDay),
      );
    } else {
      showDialog(
        context: context,
        builder: (_) => const AddExamSeriesDialog(),
      );
    }
  }

  void _confirmDeleteClass(String id, String title) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Class', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Text('Remove $title from your weekly timetable?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () {
              Navigator.pop(ctx);
              Provider.of<AcademicProvider>(context, listen: false).deleteTimetableEntry(id);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteExamSeries(String id, String title) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Exam Series', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Text('Remove $title and all its exam papers?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () {
              Navigator.pop(ctx);
              Provider.of<AcademicProvider>(context, listen: false).deleteExamSeries(id);
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
    final dayClasses = academic.timetable.where((t) => t.dayOfWeek == _selectedDay).toList()
      ..sort((a, b) => a.startTime.compareTo(b.startTime));

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Academic Schedule'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppTheme.primary, size: 28),
            onPressed: _showAddDialog,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: AppTheme.cardMuted,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _tabIndex = 0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: _tabIndex == 0 ? AppTheme.card : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: _tabIndex == 0 ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)] : null,
                        ),
                        child: Center(
                          child: Text(
                            'Weekly Classes',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: _tabIndex == 0 ? FontWeight.w800 : FontWeight.w600,
                              color: _tabIndex == 0 ? AppTheme.primary : AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _tabIndex = 1),
                      child: Container(
                        decoration: BoxDecoration(
                          color: _tabIndex == 1 ? AppTheme.card : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: _tabIndex == 1 ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)] : null,
                        ),
                        child: Center(
                          child: Text(
                            'Exam Series',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: _tabIndex == 1 ? FontWeight.w800 : FontWeight.w600,
                              color: _tabIndex == 1 ? AppTheme.primary : AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: _tabIndex == 0
          ? Column(
              children: [
                // Day Selector
                Container(
                  color: AppTheme.card,
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: List.generate(_days.length, (idx) {
                        final isSelected = _selectedDay == idx;
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ChoiceChip(
                            label: Text(
                              _days[idx],
                              style: TextStyle(
                                color: isSelected ? Colors.white : AppTheme.textSecondary,
                                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                            selected: isSelected,
                            onSelected: (_) => setState(() => _selectedDay = idx),
                            selectedColor: AppTheme.primary,
                            backgroundColor: AppTheme.cardMuted,
                            showCheckmark: false,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            side: BorderSide.none,
                          ),
                        );
                      }),
                    ),
                  ),
                ),
                const Divider(height: 1, color: AppTheme.cardBorder),

                // Class List
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () => academic.fetchDashboardData(),
                    child: dayClasses.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.coffee_outlined, size: 40, color: AppTheme.textMuted),
                                const SizedBox(height: 12),
                                const Text('No classes on this day', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                                const SizedBox(height: 4),
                                const Text('Tap the + button to add a lecture', style: TextStyle(color: AppTheme.textSecondary)),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: dayClasses.length,
                            itemBuilder: (context, idx) {
                              final item = dayClasses[idx];
                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppTheme.card,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: AppTheme.cardBorder),
                                ),
                                child: Row(
                                  children: [
                                    Column(
                                      children: [
                                        Text(item.startTime, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.primary)),
                                        Container(width: 2, height: 16, color: AppTheme.primaryLight, margin: const EdgeInsets.symmetric(vertical: 3)),
                                        Text(item.endTime, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
                                      ],
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppTheme.primaryLight,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: const Text('LECTURE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppTheme.primary)),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(item.type.isNotEmpty ? item.type : (item.moduleName ?? 'Class'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textSecondary),
                                              const SizedBox(width: 4),
                                              Text(item.location.isNotEmpty ? item.location : 'Main Hall', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 20),
                                      onPressed: () => _confirmDeleteClass(item.id, item.type),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                ),
              ],
            )
          : RefreshIndicator(
              onRefresh: () => academic.fetchDashboardData(),
              child: academic.examSeries.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.assignment_outlined, size: 40, color: AppTheme.textMuted),
                          const SizedBox(height: 12),
                          const Text('No exam series scheduled yet.', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          const Text('Tap the + button to add exam timetables', style: TextStyle(color: AppTheme.textMuted)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: academic.examSeries.length,
                      itemBuilder: (context, idx) {
                        final series = academic.examSeries[idx];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(16),
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
                                  Expanded(
                                    child: Text(
                                      series.title,
                                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryLight,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      '${series.exams.length} Papers',
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.primary),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 20),
                                    onPressed: () => _confirmDeleteExamSeries(series.id, series.title),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              const Divider(height: 1, color: AppTheme.cardBorder),
                              const SizedBox(height: 8),

                              if (series.exams.isEmpty)
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 8),
                                  child: Text('No papers listed.', style: TextStyle(color: AppTheme.textSecondary, fontStyle: FontStyle.italic)),
                                )
                              else
                                ...series.exams.map((paper) => Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: const BoxDecoration(
                                              color: AppTheme.warning,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(paper.subject, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                                                Text(DateFormat('MMM d, yyyy • h:mm a').format(paper.dateTime), style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                              ],
                                            ),
                                          ),
                                          if (paper.location.isNotEmpty)
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: AppTheme.cardMuted,
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(paper.location, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                                            ),
                                        ],
                                      ),
                                    )),
                            ],
                          ),
                        );
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primary,
        onPressed: _showAddDialog,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(_tabIndex == 0 ? 'Add Class' : 'Add Exam Series', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
