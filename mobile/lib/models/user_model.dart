class UserModel {
  final String id;
  final String registrationNumber;
  final String firstName;
  final String lastName;

  UserModel({
    required this.id,
    required this.registrationNumber,
    required this.firstName,
    required this.lastName,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      registrationNumber: json['registrationNumber']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? 'Student',
      lastName: json['lastName']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'registrationNumber': registrationNumber,
      'firstName': firstName,
      'lastName': lastName,
    };
  }
}
