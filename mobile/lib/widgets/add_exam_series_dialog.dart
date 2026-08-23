import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/academic_provider.dart';
import '../theme/app_theme.dart';
import 'package:intl/intl.dart';

class AddExamSeriesDialog extends StatefulWidget {
  const AddExamSeriesDialog({super.key});

  @override
  State<AddExamSeriesDialog> createState() => _AddExamSeriesDialogState();
}

class _ExamRowItem {
  final TextEditingController titleController = TextEditingController();
  final TextEditingController locationController = TextEditingController();
  DateTime dateTime = DateTime.now().add(const Duration(days: 7));
}

class _AddExamSeriesDialogState extends State<AddExamSeriesDialog> {
  final _seriesTitleController = TextEditingController();
  final List<_ExamRowItem> _rows = [_ExamRowItem()];
  bool _isLoading = false;

  @override
  void dispose() {
    _seriesTitleController.dispose();
    for (var r in _rows) {
      r.titleController.dispose();
      r.locationController.dispose();
    }
    super.dispose();
  }

  void _addRow() {
    setState(() {
      _rows.add(_ExamRowItem());
    });
  }

  void _removeRow(int index) {
    if (_rows.length > 1) {
      setState(() {
        _rows[index].titleController.dispose();
        _rows[index].locationController.dispose();
        _rows.removeAt(index);
      });
    }
  }

  Future<void> _pickDateTime(int index) async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _rows[index].dateTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (pickedDate != null && mounted) {
      final pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_rows[index].dateTime),
      );

      if (pickedTime != null) {
        setState(() {
          _rows[index].dateTime = DateTime(
            pickedDate.year,
            pickedDate.month,
            pickedDate.day,
            pickedTime.hour,
            pickedTime.minute,
          );
        });
      }
    }
  }

  Future<void> _handleSave() async {
    final seriesTitle = _seriesTitleController.text.trim();
    if (seriesTitle.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an Examination Series name')),
      );
      return;
    }

    final exams = _rows
        .map((r) => {
              'title': r.titleController.text.trim().isNotEmpty
                  ? r.titleController.text.trim()
                  : 'Subject Exam',
              'subject': r.titleController.text.trim().isNotEmpty
                  ? r.titleController.text.trim()
                  : 'Subject Exam',
              'dateTime': r.dateTime.toIso8601String(),
              'location': r.locationController.text.trim(),
            })
        .toList();

    setState(() => _isLoading = true);

    final academic = Provider.of<AcademicProvider>(context, listen: false);
    final success = await academic.createExamSeries(seriesTitle, exams);

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.card,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxHeight: 600, maxWidth: 500),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Add Exam Timetable', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Series Title
              const Text('EXAMINATION SERIES NAME', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.primary)),
              const SizedBox(height: 6),
              TextField(
                controller: _seriesTitleController,
                decoration: const InputDecoration(hintText: 'e.g. End Semester Examination'),
              ),
              const SizedBox(height: 16),

              const Text('EXAM PAPERS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
              const SizedBox(height: 8),

              // Papers List
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _rows.length,
                  itemBuilder: (context, idx) {
                    final row = _rows[idx];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.background,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.cardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Paper #${idx + 1}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.primary)),
                              if (_rows.length > 1)
                                GestureDetector(
                                  onTap: () => _removeRow(idx),
                                  child: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 18),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: row.titleController,
                            decoration: const InputDecoration(hintText: 'Subject / Module Name', isDense: true),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                flex: 3,
                                child: InkWell(
                                  onTap: () => _pickDateTime(idx),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: AppTheme.card,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: AppTheme.cardBorder),
                                    ),
                                    child: Text(
                                      DateFormat('MMM d, h:mm a').format(row.dateTime),
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 2,
                                child: TextField(
                                  controller: row.locationController,
                                  decoration: const InputDecoration(hintText: 'Hall', isDense: true),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              // Add Row Button
              OutlinedButton.icon(
                onPressed: _addRow,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Another Subject'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),

              // Save Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleSave,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Save All Exams', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
