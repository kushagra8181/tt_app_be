/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;
/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    // Create provider enum first
    pgm.createType('provider_enum', ['email', 'google']);

    pgm.createTable('users', {
        id: { type: 'serial', primaryKey: true },
        name: { type: 'varchar(255)', notNull: true },
        email: { type: 'varchar(255)', notNull: true, unique: true },
        password: { type: 'varchar(255)', notNull: true },
        dob: { type: 'date' },
        role: { type: 'varchar(50)' },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
        updated_at: { type: 'timestamp' },
        deleted_at: { type: 'timestamp' },
        image_url: { type: 'varchar(255)' },
        provider: { type: 'provider_enum', notNull: true, default: 'email' },
        provider_id: { type: 'text' },
        phone_number: { type: 'text' },
        auth_id: { type: 'text' }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('users');
    pgm.dropType('provider_enum');
};