import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../theme/dertam_apptheme.dart';

class DertamEditUserInfo extends StatefulWidget {
  const DertamEditUserInfo({super.key});

  @override
  State<DertamEditUserInfo> createState() => _DertamEditUserInfoState();
}

class _DertamEditUserInfoState extends State<DertamEditUserInfo> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String? _selectedGender;
  final List<String> _genderOptions = [
    'Male',
    'Female',
    'Other',
    'Prefer not to say',
  ];

  @override
  void initState() {
    super.initState();
    // Initialize with data from AuthProvider
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final userData = authProvider.userInfo;
      if (userData.data != null) {
        _nameController.text = userData.data?.name ?? '';
        _phoneController.text = userData.data?.phone ?? '';
        _emailController.text = userData.data?.email ?? '';
        _ageController.text = userData.data?.age?.toString() ?? '';
        setState(() {
          final gender = userData.data?.gender;
          if (gender != null && gender.isNotEmpty) {
            final normalizedGender =
                gender[0].toUpperCase() + gender.substring(1).toLowerCase();
            _selectedGender = _genderOptions.contains(normalizedGender)
                ? normalizedGender
                : null;
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _ageController.dispose();
    super.dispose();
  }

  IconData _getGenderIcon(String? gender) {
    switch (gender) {
      case 'Male':
        return Icons.male_rounded;
      case 'Female':
        return Icons.female_rounded;
      case 'Other':
        return Icons.transgender_rounded;
      case 'Prefer not to say':
        return Icons.person_outline_rounded;
      default:
        return Icons.person_outline_rounded;
    }
  }

  void _showGenderBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: DertamColors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            // Handle bar
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE0E0E0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            // Title
            Text(
              'Select Gender',
              style: DertamTextStyles.subtitle.copyWith(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w600,
                color: const Color(0xFF262422),
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 16),
            // Gender options
            ..._genderOptions.map((gender) => _buildGenderOption(gender)),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildGenderOption(String gender) {
    final isSelected = _selectedGender == gender;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedGender = gender;
        });
        Navigator.pop(context);
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected
              ? DertamColors.primaryBlue.withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? DertamColors.primaryBlue
                : const Color(0xFFF1ECEC),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isSelected
                    ? DertamColors.primaryBlue.withOpacity(0.15)
                    : const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                _getGenderIcon(gender),
                color: isSelected
                    ? DertamColors.primaryBlue
                    : const Color(0xFF8B939F),
                size: 22,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                gender,
                style: DertamTextStyles.bodyMedium.copyWith(
                  fontFamily: 'Poppins',
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  color: isSelected
                      ? DertamColors.primaryBlue
                      : const Color(0xFF262422),
                  fontSize: 15,
                ),
              ),
            ),
            if (isSelected)
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: DertamColors.primaryBlue,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_rounded,
                  color: Colors.white,
                  size: 16,
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _saveProfile() async {
    if (_formKey.currentState?.validate() ?? false) {
      final authProvider = context.read<AuthProvider>();
      await authProvider.updateProfile(
        _nameController.text,
        _emailController.text,
        _phoneController.text,
        _ageController.text,
        _selectedGender,
        null,
      );
      if (mounted) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading:Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: DertamColors.primaryBlue.withOpacity(0.1),
                  spreadRadius: 0,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: Icon(
                Icons.arrow_back_ios_new,
                color: DertamColors.primaryDark,
                size: 20,
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ),
        title: Text(
          'Edit Profile',
          style: DertamTextStyles.subtitle.copyWith(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            color: DertamColors.primaryBlue,
            fontSize: 24,
          ),
        ),
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 32),

                // Name Field
                Text(
                  'Name',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF262422),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFF1ECEC),
                      width: 1,
                    ),
                  ),
                  child: TextFormField(
                    controller: _nameController,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: DertamColors.primaryBlue,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your name';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // Phone Number Field
                Text(
                  'Phone Number',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF262422),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFF1ECEC),
                      width: 1,
                    ),
                  ),
                  child: TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: DertamColors.primaryBlue,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.phone_outlined,
                          color: DertamColors.primaryBlue,
                          size: 24,
                        ),
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your phone number';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // Email Field
                Text(
                  'Your Email',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF262422),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFF1ECEC),
                      width: 1,
                    ),
                  ),
                  child: TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: DertamColors.primaryBlue,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.mail_outline,
                          color: DertamColors.primaryBlue,
                          size: 24,
                        ),
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // Gender Field
                Text(
                  'Gender',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF262422),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => _showGenderBottomSheet(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 15,
                    ),
                    decoration: BoxDecoration(
                      color: DertamColors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFFF1ECEC),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _getGenderIcon(_selectedGender),
                          color: _selectedGender != null
                              ? DertamColors.primaryBlue
                              : const Color(0xFFABABAB),
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _selectedGender ?? 'Select your gender',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              fontFamily: 'Poppins',
                              fontWeight: FontWeight.w500,
                              color: _selectedGender != null
                                  ? DertamColors.primaryBlue
                                  : const Color(0xFFABABAB),
                              fontSize: 14,
                            ),
                          ),
                        ),
                        Icon(
                          Icons.keyboard_arrow_down_rounded,
                          color: DertamColors.primaryBlue,
                          size: 24,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Age Field
                Text(
                  'Age',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF262422),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFF1ECEC),
                      width: 1,
                    ),
                  ),
                  child: TextFormField(
                    controller: _ageController,
                    keyboardType: TextInputType.number,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: DertamColors.primaryBlue,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.cake_outlined,
                          color: DertamColors.primaryBlue,
                          size: 24,
                        ),
                      ),
                      hintText: 'Enter your age',
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    validator: (value) {
                      if (value != null && value.isNotEmpty) {
                        final age = int.tryParse(value);
                        if (age == null || age < 1 || age > 120) {
                          return 'Please enter a valid age';
                        }
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 60),

                // Save Button
                Container(
                  width: double.infinity,
                  height: 53,
                  decoration: BoxDecoration(
                    color: const Color(0xFF02015C),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _saveProfile,
                      borderRadius: BorderRadius.circular(20),
                      child: Center(
                        child: Text(
                          'Save',
                          style: DertamTextStyles.subtitle.copyWith(
                            fontFamily: 'Roboto',
                            fontWeight: FontWeight.w500,
                            color: DertamColors.white,
                            fontSize: 20,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
