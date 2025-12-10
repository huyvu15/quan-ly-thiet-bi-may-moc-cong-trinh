const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('../db');

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('Đang thêm dữ liệu mẫu...\n');

    // Xóa dữ liệu cũ nếu có
    console.log('Đang xóa dữ liệu cũ...');
    await client.query('DELETE FROM maintenance_records');
    await client.query('DELETE FROM machine_assignments');
    await client.query('DELETE FROM machines');
    await client.query('DELETE FROM suppliers');
    await client.query('DELETE FROM projects');
    console.log('✓ Đã xóa dữ liệu cũ\n');

    // Thêm công trình
    const projects = [
      {
        name: 'Chung cư Green Tower',
        location: '123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
        start_date: '2024-01-15',
        end_date: '2025-06-30',
        status: 'active',
        description: 'Dự án chung cư cao cấp 25 tầng với 300 căn hộ'
      },
      {
        name: 'Trung tâm thương mại Central Plaza',
        location: '456 Đường Lê Lợi, Quận 1, TP.HCM',
        start_date: '2024-03-01',
        end_date: '2025-12-31',
        status: 'active',
        description: 'Trung tâm thương mại 5 tầng với diện tích 15,000m²'
      },
      {
        name: 'Nhà máy sản xuất ABC',
        location: '789 Khu công nghiệp Bình Dương',
        start_date: '2023-06-01',
        end_date: '2024-05-15',
        status: 'completed',
        description: 'Nhà máy sản xuất đã hoàn thành'
      },
      {
        name: 'Khu đô thị mới Sunrise',
        location: '321 Đường Võ Văn Tần, Quận 3, TP.HCM',
        start_date: '2024-02-10',
        end_date: '2026-03-31',
        status: 'active',
        description: 'Khu đô thị với 500 căn biệt thự và nhà phố'
      },
      {
        name: 'Bệnh viện đa khoa Quốc tế',
        location: '654 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
        start_date: '2024-04-01',
        end_date: '2025-11-30',
        status: 'active',
        description: 'Bệnh viện 10 tầng với 500 giường bệnh'
      },
      {
        name: 'Trường học quốc tế ABC',
        location: '987 Đường Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM',
        start_date: '2023-09-01',
        end_date: '2024-08-31',
        status: 'completed',
        description: 'Trường học 4 tầng với 50 phòng học'
      },
      {
        name: 'Khách sạn 5 sao Luxury',
        location: '147 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
        start_date: '2024-05-15',
        end_date: '2026-02-28',
        status: 'active',
        description: 'Khách sạn 30 tầng với 200 phòng'
      },
      {
        name: 'Cầu vượt Ngã Tư Sở',
        location: 'Ngã Tư Sở, Quận Thanh Xuân, Hà Nội',
        start_date: '2023-11-01',
        end_date: '2024-10-31',
        status: 'completed',
        description: 'Cầu vượt dài 500m'
      }
    ];

    const projectIds = {};
    for (const proj of projects) {
      const result = await client.query(
        `INSERT INTO projects (name, location, start_date, end_date, status, description)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [proj.name, proj.location, proj.start_date, proj.end_date, proj.status, proj.description]
      );
      projectIds[proj.name] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${projects.length} công trình\n`);

    // Thêm nhà cung cấp dịch vụ bảo trì
    const suppliers = [
      {
        name: 'Công ty Bảo trì Máy móc Xây dựng ABC',
        contact_person: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'contact@abc-maintenance.com',
        address: '123 Đường Công Nghiệp, Quận 12, TP.HCM',
        tax_code: '0123456789'
      },
      {
        name: 'Dịch vụ Sửa chữa Thiết bị XYZ',
        contact_person: 'Trần Thị B',
        phone: '0907654321',
        email: 'info@xyz-repair.com',
        address: '456 Đường Kỹ Thuật, Quận Bình Tân, TP.HCM',
        tax_code: '0987654321'
      },
      {
        name: 'Công ty Bảo dưỡng Máy móc DEF',
        contact_person: 'Lê Văn C',
        phone: '0912345678',
        email: 'service@def-maintenance.com',
        address: '789 Đường Cơ Khí, Quận 7, TP.HCM',
        tax_code: '0111222333'
      },
      {
        name: 'Trung tâm Bảo hành Máy móc GHI',
        contact_person: 'Phạm Thị D',
        phone: '0923456789',
        email: 'support@ghi-warranty.com',
        address: '321 Đường Điện Cơ, Quận Tân Phú, TP.HCM',
        tax_code: '0444555666'
      },
      {
        name: 'Dịch vụ Kiểm tra An toàn Máy móc',
        contact_person: 'Hoàng Văn E',
        phone: '0934567890',
        email: 'safety@inspection.com',
        address: '654 Đường An toàn, Quận 9, TP.HCM',
        tax_code: '0777888999'
      }
    ];

    const supplierIds = {};
    for (const sup of suppliers) {
      const result = await client.query(
        `INSERT INTO suppliers (name, contact_person, phone, email, address, tax_code)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [sup.name, sup.contact_person, sup.phone, sup.email, sup.address, sup.tax_code]
      );
      supplierIds[sup.name] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${suppliers.length} nhà cung cấp\n`);

    // Thêm máy móc
    const machines = [
      {
        code: 'MM001',
        name: 'Máy đào CAT 320D',
        category: 'Máy đào',
        manufacturer: 'Caterpillar',
        model: '320D',
        serial_number: 'CAT320D-2023-001',
        purchase_date: '2023-01-15',
        purchase_price: 2500000000,
        status: 'in_use',
        description: 'Máy đào đa năng công suất lớn'
      },
      {
        code: 'MM002',
        name: 'Máy ủi Komatsu D65EX',
        category: 'Máy ủi',
        manufacturer: 'Komatsu',
        model: 'D65EX',
        serial_number: 'KOMD65-2023-002',
        purchase_date: '2023-02-20',
        purchase_price: 1800000000,
        status: 'in_use',
        description: 'Máy ủi đất công suất cao'
      },
      {
        code: 'MM003',
        name: 'Xe tải tự đổ Hyundai HD270',
        category: 'Xe tải',
        manufacturer: 'Hyundai',
        model: 'HD270',
        serial_number: 'HYUHD270-2023-003',
        purchase_date: '2023-03-10',
        purchase_price: 1200000000,
        status: 'available',
        description: 'Xe tải tự đổ tải trọng 15 tấn'
      },
      {
        code: 'MM004',
        name: 'Máy trộn bê tông Sany SYM5160',
        category: 'Máy trộn',
        manufacturer: 'Sany',
        model: 'SYM5160',
        serial_number: 'SAN5160-2023-004',
        purchase_date: '2023-04-05',
        purchase_price: 850000000,
        status: 'in_use',
        description: 'Máy trộn bê tông di động'
      },
      {
        code: 'MM005',
        name: 'Cần cẩu tháp Liebherr 132EC',
        category: 'Cần cẩu',
        manufacturer: 'Liebherr',
        model: '132EC',
        serial_number: 'LIE132EC-2023-005',
        purchase_date: '2023-05-12',
        purchase_price: 4500000000,
        status: 'in_use',
        description: 'Cần cẩu tháp tải trọng 8 tấn'
      },
      {
        code: 'MM006',
        name: 'Máy lu rung Bomag BW213',
        category: 'Máy lu',
        manufacturer: 'Bomag',
        model: 'BW213',
        serial_number: 'BOM213-2023-006',
        purchase_date: '2023-06-18',
        purchase_price: 650000000,
        status: 'maintenance',
        description: 'Máy lu rung đường bê tông'
      },
      {
        code: 'MM007',
        name: 'Máy cắt bê tông Husqvarna K970',
        category: 'Máy cắt',
        manufacturer: 'Husqvarna',
        model: 'K970',
        serial_number: 'HUSK970-2023-007',
        purchase_date: '2023-07-25',
        purchase_price: 45000000,
        status: 'available',
        description: 'Máy cắt bê tông cầm tay'
      },
      {
        code: 'MM008',
        name: 'Máy khoan địa chất Atlas Copco',
        category: 'Máy khoan',
        manufacturer: 'Atlas Copco',
        model: 'ROC L8',
        serial_number: 'ATLROC-2023-008',
        purchase_date: '2023-08-30',
        purchase_price: 3200000000,
        status: 'in_use',
        description: 'Máy khoan địa chất công suất lớn'
      },
      {
        code: 'MM009',
        name: 'Máy phát điện Cummins 500KVA',
        category: 'Máy phát điện',
        manufacturer: 'Cummins',
        model: 'C500D5',
        serial_number: 'CUM500-2023-009',
        purchase_date: '2023-09-15',
        purchase_price: 550000000,
        status: 'available',
        description: 'Máy phát điện công nghiệp'
      },
      {
        code: 'MM010',
        name: 'Xe nâng hàng Toyota 8FD30',
        category: 'Xe nâng',
        manufacturer: 'Toyota',
        model: '8FD30',
        serial_number: 'TOY8FD30-2023-010',
        purchase_date: '2023-10-20',
        purchase_price: 680000000,
        status: 'in_use',
        description: 'Xe nâng hàng tải trọng 3 tấn'
      },
      {
        code: 'MM011',
        name: 'Máy hàn điện Miller Multimatic 220',
        category: 'Máy hàn',
        manufacturer: 'Miller',
        model: 'Multimatic 220',
        serial_number: 'MIL220-2023-011',
        purchase_date: '2023-11-05',
        purchase_price: 85000000,
        status: 'available',
        description: 'Máy hàn đa năng'
      },
      {
        code: 'MM012',
        name: 'Máy đầm bê tông Wacker Neuson',
        category: 'Máy đầm',
        manufacturer: 'Wacker Neuson',
        model: 'BS60-4',
        serial_number: 'WACBS60-2023-012',
        purchase_date: '2023-12-10',
        purchase_price: 35000000,
        status: 'broken',
        description: 'Máy đầm bê tông cầm tay'
      },
      {
        code: 'MM013',
        name: 'Máy cẩu tự hành Tadano ATF 100G-4',
        category: 'Cần cẩu',
        manufacturer: 'Tadano',
        model: 'ATF 100G-4',
        serial_number: 'TAD100G-2024-001',
        purchase_date: '2024-01-15',
        purchase_price: 5200000000,
        status: 'in_use',
        description: 'Cần cẩu tự hành tải trọng 100 tấn'
      },
      {
        code: 'MM014',
        name: 'Máy xúc lật Volvo L150H',
        category: 'Máy xúc',
        manufacturer: 'Volvo',
        model: 'L150H',
        serial_number: 'VOL150H-2024-002',
        purchase_date: '2024-02-20',
        purchase_price: 2800000000,
        status: 'in_use',
        description: 'Máy xúc lật công suất lớn'
      },
      {
        code: 'MM015',
        name: 'Máy ép cọc Giken Silent Piler',
        category: 'Máy ép cọc',
        manufacturer: 'Giken',
        model: 'SP-200',
        serial_number: 'GIKSP200-2024-003',
        purchase_date: '2024-03-10',
        purchase_price: 6800000000,
        status: 'maintenance',
        description: 'Máy ép cọc không ồn'
      }
    ];

    const machineIds = {};
    for (const mach of machines) {
      const result = await client.query(
        `INSERT INTO machines (code, name, category, manufacturer, model, serial_number, purchase_date, purchase_price, status, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [mach.code, mach.name, mach.category, mach.manufacturer, mach.model, mach.serial_number, mach.purchase_date, mach.purchase_price, mach.status, mach.description]
      );
      machineIds[mach.code] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${machines.length} máy móc\n`);

    // Thêm phân công máy móc
    const assignments = [
      {
        machine_code: 'MM001',
        project_name: 'Chung cư Green Tower',
        assign_date: '2024-01-20',
        assigned_by: 'Nguyễn Văn A',
        notes: 'Phân công cho công đoạn đào móng'
      },
      {
        machine_code: 'MM002',
        project_name: 'Chung cư Green Tower',
        assign_date: '2024-01-22',
        assigned_by: 'Nguyễn Văn A',
        notes: 'Phân công san lấp mặt bằng'
      },
      {
        machine_code: 'MM004',
        project_name: 'Trung tâm thương mại Central Plaza',
        assign_date: '2024-03-05',
        assigned_by: 'Trần Thị B',
        notes: 'Phục vụ đổ bê tông tầng 1'
      },
      {
        machine_code: 'MM005',
        project_name: 'Trung tâm thương mại Central Plaza',
        assign_date: '2024-03-10',
        assigned_by: 'Trần Thị B',
        notes: 'Lắp đặt cần cẩu cho công trình'
      },
      {
        machine_code: 'MM008',
        project_name: 'Khu đô thị mới Sunrise',
        assign_date: '2024-02-15',
        assigned_by: 'Lê Văn C',
        notes: 'Khoan khảo sát địa chất'
      },
      {
        machine_code: 'MM010',
        project_name: 'Bệnh viện đa khoa Quốc tế',
        assign_date: '2024-04-10',
        assigned_by: 'Phạm Thị D',
        notes: 'Vận chuyển vật liệu xây dựng'
      },
      {
        machine_code: 'MM013',
        project_name: 'Khách sạn 5 sao Luxury',
        assign_date: '2024-05-20',
        assigned_by: 'Hoàng Văn E',
        notes: 'Lắp đặt kết cấu thép'
      },
      {
        machine_code: 'MM014',
        project_name: 'Khách sạn 5 sao Luxury',
        assign_date: '2024-05-25',
        assigned_by: 'Hoàng Văn E',
        notes: 'Vận chuyển vật liệu'
      }
    ];

    for (const assign of assignments) {
      await client.query(
        `INSERT INTO machine_assignments (machine_id, project_id, assign_date, assigned_by, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [machineIds[assign.machine_code], projectIds[assign.project_name], assign.assign_date, assign.assigned_by, assign.notes]
      );
    }
    console.log(`✓ Đã thêm ${assignments.length} phân công máy móc\n`);

    // Thêm bản ghi bảo trì
    const maintenanceRecords = [
      {
        record_number: 'BT001',
        machine_code: 'MM001',
        project_name: 'Chung cư Green Tower',
        supplier_name: 'Công ty Bảo trì Máy móc Xây dựng ABC',
        maintenance_date: '2024-02-15',
        maintenance_type: 'preventive',
        cost: 5000000,
        description: 'Bảo trì định kỳ: thay dầu, lọc dầu, kiểm tra hệ thống thủy lực',
        next_maintenance_date: '2024-05-15',
        performed_by: 'Nguyễn Văn A',
        created_by: 'admin'
      },
      {
        record_number: 'BT002',
        machine_code: 'MM006',
        project_name: null,
        supplier_name: 'Dịch vụ Sửa chữa Thiết bị XYZ',
        maintenance_date: '2024-07-01',
        maintenance_type: 'repair',
        cost: 15000000,
        description: 'Sửa chữa động cơ, thay phụ tùng',
        next_maintenance_date: '2024-10-01',
        performed_by: 'Trần Thị B',
        created_by: 'admin'
      },
      {
        record_number: 'BT003',
        machine_code: 'MM004',
        project_name: 'Trung tâm thương mại Central Plaza',
        supplier_name: 'Công ty Bảo dưỡng Máy móc DEF',
        maintenance_date: '2024-04-20',
        maintenance_type: 'preventive',
        cost: 3500000,
        description: 'Bảo dưỡng định kỳ máy trộn',
        next_maintenance_date: '2024-07-20',
        performed_by: 'Lê Văn C',
        created_by: 'admin'
      },
      {
        record_number: 'BT004',
        machine_code: 'MM012',
        project_name: null,
        supplier_name: 'Trung tâm Bảo hành Máy móc GHI',
        maintenance_date: '2024-01-10',
        maintenance_type: 'repair',
        cost: 8000000,
        description: 'Sửa chữa máy đầm bị hỏng động cơ',
        next_maintenance_date: null,
        performed_by: 'Phạm Thị D',
        created_by: 'admin'
      },
      {
        record_number: 'BT005',
        machine_code: 'MM005',
        project_name: 'Trung tâm thương mại Central Plaza',
        supplier_name: 'Công ty Bảo trì Máy móc Xây dựng ABC',
        maintenance_date: '2024-03-25',
        maintenance_type: 'inspection',
        cost: 2000000,
        description: 'Kiểm tra an toàn cần cẩu tháp',
        next_maintenance_date: '2024-06-25',
        performed_by: 'Hoàng Văn E',
        created_by: 'admin'
      },
      {
        record_number: 'BT006',
        machine_code: 'MM015',
        project_name: null,
        supplier_name: 'Dịch vụ Sửa chữa Thiết bị XYZ',
        maintenance_date: '2024-03-20',
        maintenance_type: 'repair',
        cost: 25000000,
        description: 'Sửa chữa hệ thống ép cọc, thay phụ tùng',
        next_maintenance_date: '2024-06-20',
        performed_by: 'Nguyễn Văn A',
        created_by: 'admin'
      },
      {
        record_number: 'BT007',
        machine_code: 'MM002',
        project_name: 'Chung cư Green Tower',
        supplier_name: 'Công ty Bảo dưỡng Máy móc DEF',
        maintenance_date: '2024-02-28',
        maintenance_type: 'preventive',
        cost: 6000000,
        description: 'Bảo trì định kỳ máy ủi',
        next_maintenance_date: '2024-05-28',
        performed_by: 'Trần Thị B',
        created_by: 'admin'
      },
      {
        record_number: 'BT008',
        machine_code: 'MM010',
        project_name: 'Bệnh viện đa khoa Quốc tế',
        supplier_name: 'Trung tâm Bảo hành Máy móc GHI',
        maintenance_date: '2024-04-15',
        maintenance_type: 'preventive',
        cost: 4000000,
        description: 'Bảo dưỡng xe nâng hàng',
        next_maintenance_date: '2024-07-15',
        performed_by: 'Lê Văn C',
        created_by: 'admin'
      },
      {
        record_number: 'BT009',
        machine_code: 'MM013',
        project_name: 'Khách sạn 5 sao Luxury',
        supplier_name: 'Công ty Bảo trì Máy móc Xây dựng ABC',
        maintenance_date: '2024-05-30',
        maintenance_type: 'inspection',
        cost: 3000000,
        description: 'Kiểm tra an toàn cần cẩu tự hành',
        next_maintenance_date: '2024-08-30',
        performed_by: 'Phạm Thị D',
        created_by: 'admin'
      },
      {
        record_number: 'BT010',
        machine_code: 'MM008',
        project_name: 'Khu đô thị mới Sunrise',
        supplier_name: 'Dịch vụ Kiểm tra An toàn Máy móc',
        maintenance_date: '2024-02-25',
        maintenance_type: 'inspection',
        cost: 2500000,
        description: 'Kiểm tra an toàn máy khoan địa chất',
        next_maintenance_date: '2024-05-25',
        performed_by: 'Hoàng Văn E',
        created_by: 'admin'
      }
    ];

    for (const maint of maintenanceRecords) {
      await client.query(
        `INSERT INTO maintenance_records (record_number, machine_id, project_id, supplier_id, maintenance_date, maintenance_type, cost, description, next_maintenance_date, performed_by, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          maint.record_number,
          machineIds[maint.machine_code],
          maint.project_name ? projectIds[maint.project_name] : null,
          maint.supplier_name ? supplierIds[maint.supplier_name] : null,
          maint.maintenance_date,
          maint.maintenance_type,
          maint.cost,
          maint.description,
          maint.next_maintenance_date,
          maint.performed_by,
          maint.created_by
        ]
      );
    }
    console.log(`✓ Đã thêm ${maintenanceRecords.length} bản ghi bảo trì\n`);

    await client.query('COMMIT');
    console.log('✓ Hoàn thành thêm dữ liệu mẫu!\n');
    console.log('Tóm tắt:');
    console.log(`- ${projects.length} công trình`);
    console.log(`- ${suppliers.length} nhà cung cấp`);
    console.log(`- ${machines.length} máy móc`);
    console.log(`- ${assignments.length} phân công`);
    console.log(`- ${maintenanceRecords.length} bản ghi bảo trì`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi thêm dữ liệu:', error);
    throw error;
  } finally {
    client.release();
  }
};

seedData()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
