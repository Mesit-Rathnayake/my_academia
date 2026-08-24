import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/exam_model.dart';
import '../providers/academic_provider.dart';
import '../theme/app_theme.dart';
import 'package:intl/intl.dart';

class AddExamSeriesDialog extends StatefulWidget {
  final ExamSeries? initialSeries;
  const AddExamSeriesDialog({super.key, this.initialSeries});

  @override
  State<AddExamSeriesDialog> createState() => _AddExamSeriesDialogState();
}

class _ExamRowItem {
  final TextEditingController titleController;
  final TextEditingController locationController;
  DateTime dateTime;

  _ExamRowItem({String title = '', String location = '', DateTime? dt})
      : titleController = TextEditingController(text: title),
        locationController = TextEditingController(text: location),
        dateTime = dt ?? DateTime.now().add(const Duration(days: 7));
}

class _AddExamSeriesDialogState extends State<AddExamSeriesDialog> {
  late final TextEditingController _seriesTitleController;
  late final List<_ExamRowItem> _rows;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final s = widget.initialSeries;
    _seriesTitleController = TextEditingController(text: s?.title ?? '');

    if (s != null && s.exams.isNotEmpty) {
      _rows = s.exams
          .map((e) => _ExamRowItem(
                title: e.title,
                location: e.location ?? '',
                dt: e.dateTime,
              ))
          .toList();
    } else {
      _rows = [_ExamRowItem()];
    }
  }

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
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
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
              'date': r.dateTime.toIso8601String(),
              'location': r.locationController.text.trim(),
            })
        .toList();

    setState(() => _isLoading = true);

    final academic = Provider.of<AcademicProvider>(context, listen: false);
    final bool success;
    if (widget.initialSeries != null) {
      success = await academic.updateExamSeries(widget.initialSeries!.id, seriesTitle, exams);
    } else {
      success = await academic.createExamSeries(seriesTitle, exams);
    }

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.initialSeries != null;

    return Dialog(
      backgroundColor: AppTheme.card,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxHeight: 620, maxWidth: 500),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isEditing ? 'Edit Exam Series' : 'Add Exam Series',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _seriesTitleController,
                decoration: InputDecoration(
                  labelText: 'Series Name (e.g. End Semester Fall 2026)',
                  prefixIcon: const Icon(Icons.school_outlined, color: AppTheme.primary),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                  filled: true,
                  fillColor: AppTheme.background,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Exam Papers / Subjects',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: _rows.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final row = _rows[index];
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.background,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 12,
                                backgroundColor: AppTheme.primary.withOpacity(0.1),
                                child: Text(
                                  '${index + 1}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextField(
                                  controller: row.titleController,
                                  decoration: const InputDecoration(
                                    hintText: 'Subject / Module Name',
                                    isDense: true,
                                    border: InputBorder.none,
                                  ),
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ),
                              if (_rows.length > 1)
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                                  onPressed: () => _removeRow(index),
                                ),
                            ],
                          ),
                          const Divider(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: InkWell(
                                  onTap: () => _pickDateTime(index),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: AppTheme.card,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: AppTheme.border),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.calendar_today, size: 14, color: AppTheme.primary),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            DateFormat('MMM dd, HH:mm').format(row.dateTime),
                                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10),
                                  decoration: BoxDecoration(
                                    color: AppTheme.card,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: AppTheme.border),
                                  ),
                                  child: TextField(
                                    controller: row.locationController,
                                    decoration: const InputDecoration(
                                      hintText: 'Location (Hall A)',
                                      isDense: true,
                                      border: InputBorder.none,
                                    ),
                                    style: const TextStyle(fontSize: 12),
                                  ),
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
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _addRow,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Another Subject'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSave,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : Text(
                        isEditing ? 'Update Exam Series' : 'Save Exam Series',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
