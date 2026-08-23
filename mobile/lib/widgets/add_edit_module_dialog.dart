import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/module_model.dart';
import '../providers/academic_provider.dart';
import '../theme/app_theme.dart';

class AddEditModuleDialog extends StatefulWidget {
  final ModuleModel? initialModule;

  const AddEditModuleDialog({super.key, this.initialModule});

  @override
  State<AddEditModuleDialog> createState() => _AddEditModuleDialogState();
}

class _AddEditModuleDialogState extends State<AddEditModuleDialog> {
  final _nameController = TextEditingController();
  final _codeController = TextEditingController();
  final _totalLecturesController = TextEditingController(text: '45');
  final _conductedLecturesController = TextEditingController(text: '0');
  final _attendedLecturesController = TextEditingController(text: '0');

  int _selectedSemester = 1;
  int _credits = 3;
  bool _isGpa = true;
  bool _isLoading = false;

  final List<AssignmentModel> _assignments = [];
  final List<LabModel> _labs = [];

  @override
  void initState() {
    super.initState();
    if (widget.initialModule != null) {
      final m = widget.initialModule!;
      _nameController.text = m.moduleName;
      _codeController.text = m.moduleCode;
      _selectedSemester = m.semester;
      _credits = m.credits;
      _isGpa = m.isGpa;
      _totalLecturesController.text = m.totalLectures.toString();
      _conductedLecturesController.text = m.conductedLectures.toString();
      _attendedLecturesController.text = m.attendedLectures.toString();
      _assignments.addAll(m.assignments);
      _labs.addAll(m.labs);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _totalLecturesController.dispose();
    _conductedLecturesController.dispose();
    _attendedLecturesController.dispose();
    super.dispose();
  }

  void _addAssignment() {
    setState(() {
      _assignments.add(AssignmentModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: 'Assignment ${_assignments.length + 1}',
        status: 'Pending',
      ));
    });
  }

  void _addLab() {
    setState(() {
      _labs.add(LabModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: 'Lab Session ${_labs.length + 1}',
        status: 'Pending',
      ));
    });
  }

  Future<void> _handleSave() async {
    final name = _nameController.text.trim();
    final code = _codeController.text.trim();

    if (name.isEmpty || code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter Module Name and Code')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final data = {
      'moduleName': name,
      'moduleCode': code,
      'semester': _selectedSemester,
      'credits': _credits,
      'isGpa': _isGpa,
      'totalLectures': int.tryParse(_totalLecturesController.text) ?? 45,
      'conductedLectures': int.tryParse(_conductedLecturesController.text) ?? 0,
      'attendedLectures': int.tryParse(_attendedLecturesController.text) ?? 0,
      'assignments': _assignments.map((a) => a.toJson()).toList(),
      'labs': _labs.map((l) => l.toJson()).toList(),
    };

    final academic = Provider.of<AcademicProvider>(context, listen: false);
    bool success;

    if (widget.initialModule != null) {
      success = await academic.updateModule(widget.initialModule!.id, data);
    } else {
      success = await academic.createModule(data);
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
    final isEditing = widget.initialModule != null;

    return Dialog(
      backgroundColor: AppTheme.card,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxHeight: 650, maxWidth: 550),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isEditing ? 'Edit Module' : 'Add New Module',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Module Name
                      const Text('MODULE NAME', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(hintText: 'e.g. Data Structures & Algorithms'),
                      ),
                      const SizedBox(height: 16),

                      // Code & Semester Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('MODULE CODE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: _codeController,
                                  textCapitalization: TextCapitalization.characters,
                                  decoration: const InputDecoration(hintText: 'e.g. CS2012'),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('SEMESTER', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  decoration: BoxDecoration(
                                    color: AppTheme.background,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppTheme.cardBorder),
                                  ),
                                  child: DropdownButtonHideUnderline(
                                    child: DropdownButton<int>(
                                      value: _selectedSemester,
                                      isExpanded: true,
                                      items: List.generate(8, (i) => i + 1).map((sem) {
                                        return DropdownMenuItem<int>(
                                          value: sem,
                                          child: Text('Semester $sem', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                        );
                                      }).toList(),
                                      onChanged: (val) => setState(() => _selectedSemester = val ?? 1),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Attendance Section
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.background,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.cardBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('ATTENDANCE TRACKING', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primary)),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Expected', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                                      const SizedBox(height: 4),
                                      TextField(controller: _totalLecturesController, keyboardType: TextInputType.number, isDense: true),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Conducted', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                                      const SizedBox(height: 4),
                                      TextField(controller: _conductedLecturesController, keyboardType: TextInputType.number, isDense: true),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Attended', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                                      const SizedBox(height: 4),
                                      TextField(controller: _attendedLecturesController, keyboardType: TextInputType.number, isDense: true),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Assignments Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('CONTINUOUS ASSESSMENTS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
                          TextButton.icon(
                            onPressed: _addAssignment,
                            icon: const Icon(Icons.add, size: 16),
                            label: const Text('Add', style: TextStyle(fontSize: 12)),
                          ),
                        ],
                      ),
                      ..._assignments.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final a = entry.value;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.background,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.cardBorder),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(a.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                              ),
                              DropdownButton<String>(
                                value: a.status,
                                underline: const SizedBox(),
                                isDense: true,
                                items: ['Pending', 'Submitted', 'Graded'].map((s) {
                                  return DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 12)));
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) {
                                    setState(() {
                                      _assignments[idx] = AssignmentModel(id: a.id, title: a.title, status: val);
                                    });
                                  }
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.danger),
                                onPressed: () => setState(() => _assignments.removeAt(idx)),
                              ),
                            ],
                          ),
                        );
                      }),
                      const SizedBox(height: 12),

                      // Labs Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('LAB SESSIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
                          TextButton.icon(
                            onPressed: _addLab,
                            icon: const Icon(Icons.add, size: 16),
                            label: const Text('Add', style: TextStyle(fontSize: 12)),
                          ),
                        ],
                      ),
                      ..._labs.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final l = entry.value;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.background,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.cardBorder),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(l.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                              ),
                              DropdownButton<String>(
                                value: l.status,
                                underline: const SizedBox(),
                                isDense: true,
                                items: ['Pending', 'Conducted', 'Graded'].map((s) {
                                  return DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 12)));
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) {
                                    setState(() {
                                      _labs[idx] = LabModel(id: l.id, title: l.title, status: val);
                                    });
                                  }
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.danger),
                                onPressed: () => setState(() => _labs.removeAt(idx)),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
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
                      : Text(isEditing ? 'Save Changes' : 'Create Module', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
