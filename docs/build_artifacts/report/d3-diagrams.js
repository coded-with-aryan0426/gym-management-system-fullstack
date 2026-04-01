/**
 * Smart GMS D3.js Interactive Diagrams
 * Creates accurate, interactive ER diagrams, UML diagrams, Use Case diagrams, and Architecture diagrams
 * Using real data from production codebase
 */

class D3DiagramBuilder {
  constructor() {
    this.colors = {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      gray: '#64748b',
      lightGray: '#f1f5f9',
      border: '#e2e8f0',
      entity: '#eff6ff',
      entityBorder: '#3b82f6',
      relationship: '#f0fdf4',
      relationshipBorder: '#10b981',
      actor: '#fef3c7',
      actorBorder: '#f59e0b',
      usecase: '#f5f3ff',
      usecaseBorder: '#8b5cf6'
    };
  }

  /**
   * Create Interactive ER Diagram for User Authentication & RBAC
   */
  createAuthERDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html(''); // Clear existing content

    const width = 1200;
    const height = 700;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    // Add zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Define entities with real schema data
    const entities = [
      {
        id: 'user',
        name: 'User',
        x: 200,
        y: 250,
        fields: [
          { name: 'user_id', type: 'IDENTITY PK', key: true },
          { name: 'username', type: 'VARCHAR(50) UNIQUE' },
          { name: 'email', type: 'VARCHAR(255) UNIQUE' },
          { name: 'password', type: 'VARCHAR(255)' },
          { name: 'fullName', type: 'VARCHAR(100)' },
          { name: 'phone', type: 'VARCHAR(20)' },
          { name: 'googleId', type: 'VARCHAR(255)' },
          { name: 'authProvider', type: 'VARCHAR(50)' },
          { name: 'status', type: 'VARCHAR(20)' },
          { name: 'isDeleted', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'role',
        name: 'Role',
        x: 650,
        y: 150,
        fields: [
          { name: 'role_id', type: 'IDENTITY PK', key: true },
          { name: 'roleName', type: 'VARCHAR(50) UNIQUE' }
        ]
      },
      {
        id: 'user_role_map',
        name: 'user_role_map',
        x: 450,
        y: 250,
        fields: [
          { name: 'user_id', type: 'FK → User', key: true },
          { name: 'role_id', type: 'FK → Role', key: true }
        ],
        isJunction: true
      },
      {
        id: 'user_gym_roles',
        name: 'User Gym Role',
        x: 200,
        y: 520,
        fields: [
          { name: 'id', type: 'IDENTITY PK', key: true },
          { name: 'user_id', type: 'FK → User' },
          { name: 'gym_id', type: 'FK → Gym' },
          { name: 'role', type: 'ENUM' },
          { name: 'status', type: 'ENUM' },
          { name: 'grantedBy', type: 'FK → User' },
          { name: 'grantedAt', type: 'TIMESTAMP' },
          { name: 'expiresAt', type: 'TIMESTAMP' }
        ]
      },
      {
        id: 'role_permissions',
        name: 'Role Permission',
        x: 650,
        y: 400,
        fields: [
          { name: 'permission_id', type: 'IDENTITY PK', key: true },
          { name: 'role', type: 'ENUM' },
          { name: 'permission', type: 'ENUM' },
          { name: 'scope', type: 'VARCHAR(50)' },
          { name: 'is_active', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'gym',
        name: 'Gym',
        x: 950,
        y: 250,
        fields: [
          { name: 'gym_id', type: 'IDENTITY PK', key: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'owner_id', type: 'FK → User' },
          { name: 'inviteCode', type: 'VARCHAR(10) UNIQUE' },
          { name: 'subscription_plan', type: 'VARCHAR(50)' }
        ]
      }
    ];

    // Define relationships
    const relationships = [
      { from: 'user', to: 'user_role_map', label: 'has', type: 'one-to-many' },
      { from: 'role', to: 'user_role_map', label: 'assigned', type: 'one-to-many' },
      { from: 'user', to: 'user_gym_roles', label: 'has roles in', type: 'one-to-many' },
      { from: 'gym', to: 'user_gym_roles', label: 'grants roles', type: 'one-to-many' },
      { from: 'role', to: 'role_permissions', label: 'has permissions', type: 'one-to-many' },
      { from: 'gym', to: 'user', label: 'owned by', type: 'many-to-one' }
    ];

    // Draw relationships first (so they appear behind entities)
    this.drawRelationships(g, entities, relationships);

    // Draw entities
    this.drawEntities(g, entities);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('ER Diagram: User Authentication & RBAC');

    // Add legend
    this.addERLegend(svg, width, height);

    // Add controls
    this.addZoomControls(svg, zoom, width, height);

    return svg.node();
  }

  /**
   * Create Interactive Membership ER Diagram
   */
  createGymERDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1300;
    const height = 700;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    const entities = [
      {
        id: 'gym',
        name: 'GYMS',
        x: 300,
        y: 200,
        fields: [
          { name: 'gym_id', type: 'BIGINT PK', key: true },
          { name: 'name', type: 'VARCHAR(255)' },
          { name: 'address', type: 'VARCHAR(500)' },
          { name: 'city', type: 'VARCHAR(100)' },
          { name: 'phone', type: 'VARCHAR(20)' },
          { name: 'subscription_plan', type: 'VARCHAR(50)' },
          { name: 'owner_id', type: 'FK → User' },
          { name: 'invite_code', type: 'VARCHAR(50)' }
        ]
      },
      {
        id: 'gym_settings',
        name: 'GYM_SETTINGS',
        x: 750,
        y: 200,
        fields: [
          { name: 'gym_id', type: 'BIGINT PK FK', key: true },
          { name: 'business_hours', type: 'VARCHAR(255)' },
          { name: 'notification_settings', type: 'CLOB' },
          { name: 'branding', type: 'VARCHAR(255)' }
        ]
      },
      {
        id: 'gym_staff',
        name: 'GYM_STAFF',
        x: 300,
        y: 500,
        fields: [
          { name: 'staff_id', type: 'BIGINT PK', key: true },
          { name: 'gym_id', type: 'FK → Gym' },
          { name: 'user_id', type: 'FK → User' },
          { name: 'role', type: 'VARCHAR(50)' },
          { name: 'status', type: 'VARCHAR(20)' }
        ]
      },
      {
        id: 'equipment',
        name: 'EQUIPMENT',
        x: 1000,
        y: 450,
        fields: [
          { name: 'equipment_id', type: 'BIGINT PK', key: true },
          { name: 'gym_id', type: 'FK → Gym' },
          { name: 'name', type: 'VARCHAR(255)' },
          { name: 'category', type: 'VARCHAR(100)' },
          { name: 'quantity', type: 'INT' },
          { name: 'status', type: 'VARCHAR(20)' }
        ]
      }
    ];

    this.drawEntities(g, entities);

    const relationships = [
      { from: 'gym', to: 'gym_settings', type: 'one-to-one', label: 'has' },
      { from: 'gym', to: 'gym_staff', type: 'one-to-many', label: 'employs' },
      { from: 'gym', to: 'equipment', type: 'one-to-many', label: 'owns' }
    ];

    this.drawRelationships(g, entities, relationships);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('ER Diagram: Gym Management Entities');

    return svg.node();
  }

  /**
   * Create Interactive Membership ER Diagram
   */
  createMembershipERDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1400;
    const height = 800;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    const entities = [
      {
        id: 'user',
        name: 'User',
        x: 150,
        y: 350,
        fields: [
          { name: 'user_id', type: 'PK', key: true },
          { name: 'username', type: 'VARCHAR' },
          { name: 'email', type: 'VARCHAR' }
        ]
      },
      {
        id: 'gym',
        name: 'Gym',
        x: 150,
        y: 150,
        fields: [
          { name: 'gym_id', type: 'PK', key: true },
          { name: 'name', type: 'VARCHAR' },
          { name: 'owner_id', type: 'FK → User' }
        ]
      },
      {
        id: 'membership',
        name: 'Membership',
        x: 500,
        y: 250,
        fields: [
          { name: 'membership_id', type: 'PK', key: true },
          { name: 'gym_id', type: 'FK → Gym' },
          { name: 'user_id', type: 'FK → User' },
          { name: 'package_id', type: 'FK (legacy)' },
          { name: 'tiered_plan_id', type: 'FK → Plan' },
          { name: 'plan_variant_id', type: 'FK → Variant' },
          { name: 'status', type: 'ENUM' },
          { name: 'startDate', type: 'DATE' },
          { name: 'endDate', type: 'DATE' },
          { name: 'autoRenew', type: 'BOOLEAN' },
          { name: 'freeze_days', type: 'NUMBER' }
        ]
      },
      {
        id: 'tiered_plan',
        name: 'Tiered Membership Plan',
        x: 900,
        y: 150,
        fields: [
          { name: 'plan_id', type: 'PK', key: true },
          { name: 'plan_name', type: 'VARCHAR UNIQUE' },
          { name: 'description', type: 'VARCHAR' },
          { name: 'category', type: 'ENUM' },
          { name: 'plan_color', type: 'VARCHAR' },
          { name: 'status', type: 'ENUM' },
          { name: 'is_recommended', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'plan_variant',
        name: 'Plan Variant',
        x: 900,
        y: 400,
        fields: [
          { name: 'variant_id', type: 'PK', key: true },
          { name: 'plan_id', type: 'FK → Plan' },
          { name: 'duration_value', type: 'NUMBER' },
          { name: 'duration_unit', type: 'ENUM' },
          { name: 'price', type: 'DECIMAL' },
          { name: 'discount_percent', type: 'DECIMAL' },
          { name: 'included_pt_sessions', type: 'NUMBER' },
          { name: 'is_popular', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'plan_feature',
        name: 'Plan Feature',
        x: 1200,
        y: 250,
        fields: [
          { name: 'feature_id', type: 'PK', key: true },
          { name: 'plan_id', type: 'FK → Plan' },
          { name: 'name', type: 'VARCHAR' },
          { name: 'description', type: 'VARCHAR' },
          { name: 'category', type: 'ENUM' },
          { name: 'is_included', type: 'BOOLEAN' }
        ]
      },
      {
        id: 'membership_package',
        name: 'Membership Package (Legacy)',
        x: 500,
        y: 550,
        fields: [
          { name: 'package_id', type: 'PK', key: true },
          { name: 'package_name', type: 'VARCHAR' },
          { name: 'price', type: 'DECIMAL' },
          { name: 'duration_days', type: 'NUMBER' },
          { name: 'is_active', type: 'BOOLEAN' }
        ]
      }
    ];

    const relationships = [
      { from: 'user', to: 'membership', label: 'subscribes', type: 'one-to-many' },
      { from: 'gym', to: 'membership', label: 'offers', type: 'one-to-many' },
      { from: 'membership', to: 'tiered_plan', label: 'based on', type: 'many-to-one' },
      { from: 'membership', to: 'plan_variant', label: 'uses', type: 'many-to-one' },
      { from: 'tiered_plan', to: 'plan_variant', label: 'has variants', type: 'one-to-many' },
      { from: 'tiered_plan', to: 'plan_feature', label: 'includes features', type: 'one-to-many' },
      { from: 'membership', to: 'membership_package', label: 'legacy link', type: 'many-to-one', dashed: true }
    ];

    this.drawRelationships(g, entities, relationships);
    this.drawEntities(g, entities);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('ER Diagram: Membership & Plans System');

    this.addERLegend(svg, width, height);
    this.addZoomControls(svg, zoom, width, height);

    return svg.node();
  }

  /**
   * Create Interactive Use Case Diagram
   */
  createUseCaseDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1200;
    const height = 800;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Define actors
    const actors = [
      { id: 'member', name: 'Member', x: 100, y: 400 },
      { id: 'trainer', name: 'Trainer', x: 100, y: 200 },
      { id: 'admin', name: 'Admin', x: 100, y: 100 },
      { id: 'owner', name: 'Gym Owner', x: 100, y: 600 },
      { id: 'superadmin', name: 'Super Admin', x: 100, y: 700 }
    ];

    // Define use cases with real system features
    const useCases = [
      // Member use cases
      { id: 'login', name: 'Login/Signup\nwith OTP', x: 350, y: 400, actors: ['member', 'trainer', 'admin', 'owner'] },
      { id: 'viewMembership', name: 'View Membership\nDetails', x: 550, y: 350, actors: ['member'] },
      { id: 'checkIn', name: 'Check In/Out\nat Gym', x: 550, y: 450, actors: ['member'] },
      { id: 'bookPT', name: 'Book PT Session', x: 750, y: 400, actors: ['member'] },
      { id: 'viewDiet', name: 'View Diet &\nWorkout Plans', x: 750, y: 500, actors: ['member'] },
      { id: 'chat', name: 'Chat with\nTrainer', x: 550, y: 550, actors: ['member', 'trainer'] },
      
      // Trainer use cases
      { id: 'manageSessions', name: 'Manage PT\nSessions', x: 550, y: 200, actors: ['trainer'] },
      { id: 'createWorkout', name: 'Create Workout\n& Diet Plans', x: 750, y: 200, actors: ['trainer'] },
      { id: 'trackProgress', name: 'Track Member\nProgress', x: 950, y: 200, actors: ['trainer'] },
      
      // Admin use cases
      { id: 'manageMembers', name: 'Manage Members\n& Staff', x: 550, y: 100, actors: ['admin', 'owner'] },
      { id: 'approveMembership', name: 'Approve\nMemberships', x: 750, y: 50, actors: ['admin'] },
      { id: 'manageEquipment', name: 'Manage\nEquipment', x: 950, y: 100, actors: ['admin'] },
      { id: 'viewReports', name: 'View Analytics\n& Reports', x: 950, y: 300, actors: ['admin', 'owner'] },
      
      // Owner use cases
      { id: 'configureGym', name: 'Configure Gym\nSettings', x: 550, y: 600, actors: ['owner'] },
      { id: 'managePlans', name: 'Manage\nMembership Plans', x: 750, y: 600, actors: ['owner'] },
      { id: 'assignRoles', name: 'Assign Staff\nRoles & Permissions', x: 950, y: 600, actors: ['owner'] },
      
      // Super Admin
      { id: 'systemConfig', name: 'System-wide\nConfiguration', x: 550, y: 700, actors: ['superadmin'] },
      { id: 'auditLogs', name: 'View Audit\nLogs', x: 750, y: 700, actors: ['superadmin'] }
    ];

    // Draw system boundary
    g.append('rect')
      .attr('x', 300)
      .attr('y', 30)
      .attr('width', 720)
      .attr('height', 710)
      .attr('rx', 10)
      .attr('fill', 'none')
      .attr('stroke', this.colors.border)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    g.append('text')
      .attr('x', 660)
      .attr('y', 55)
      .attr('text-anchor', 'middle')
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('fill', this.colors.gray)
      .text('Smart Gym Management System');

    // Draw connections
    useCases.forEach(useCase => {
      useCase.actors.forEach(actorId => {
        const actor = actors.find(a => a.id === actorId);
        if (actor) {
          g.append('line')
            .attr('x1', actor.x + 40)
            .attr('y1', actor.y)
            .attr('x2', useCase.x - 60)
            .attr('y2', useCase.y)
            .attr('stroke', this.colors.border)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.4);
        }
      });
    });

    // Draw actors (stick figures)
    actors.forEach(actor => {
      const actorGroup = g.append('g')
        .attr('transform', `translate(${actor.x}, ${actor.y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).select('circle').attr('fill', this.colors.actorBorder || '#f59e0b');
          // Highlight connected use cases
          useCases.forEach(uc => {
            if (uc.actors.includes(actor.id)) {
              g.selectAll(`#usecase-${uc.id}`).attr('stroke-width', 3);
            }
          });
        }.bind(this))
        .on('mouseleave', function() {
          d3.select(this).select('circle').attr('fill', this.colors.actor || '#fef3c7');
          g.selectAll('ellipse').attr('stroke-width', 2);
        }.bind(this));

      // Head
      actorGroup.append('circle')
        .attr('cx', 0)
        .attr('cy', -30)
        .attr('r', 12)
        .attr('fill', this.colors.actor)
        .attr('stroke', this.colors.actorBorder)
        .attr('stroke-width', 2);

      // Body
      actorGroup.append('line')
        .attr('x1', 0)
        .attr('y1', -18)
        .attr('x2', 0)
        .attr('y2', 10)
        .attr('stroke', this.colors.actorBorder)
        .attr('stroke-width', 2);

      // Arms
      actorGroup.append('line')
        .attr('x1', -15)
        .attr('y1', -5)
        .attr('x2', 15)
        .attr('y2', -5)
        .attr('stroke', this.colors.actorBorder)
        .attr('stroke-width', 2);

      // Legs
      actorGroup.append('line')
        .attr('x1', 0)
        .attr('y1', 10)
        .attr('x2', -10)
        .attr('y2', 25)
        .attr('stroke', this.colors.actorBorder)
        .attr('stroke-width', 2);

      actorGroup.append('line')
        .attr('x1', 0)
        .attr('y1', 10)
        .attr('x2', 10)
        .attr('y2', 25)
        .attr('stroke', this.colors.actorBorder)
        .attr('stroke-width', 2);

      // Label
      actorGroup.append('text')
        .attr('x', 0)
        .attr('y', 45)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', '600')
        .attr('fill', '#0f172a')
        .text(actor.name);
    });

    // Draw use cases (ellipses)
    useCases.forEach(useCase => {
      const ucGroup = g.append('g')
        .attr('id', `usecase-${useCase.id}`)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).select('ellipse').attr('fill', '#ddd6fe');
          d3.select(this).select('ellipse').attr('stroke-width', 3);
        })
        .on('mouseleave', function() {
          d3.select(this).select('ellipse').attr('fill', this.colors.usecase);
          d3.select(this).select('ellipse').attr('stroke-width', 2);
        }.bind(this));

      ucGroup.append('ellipse')
        .attr('cx', useCase.x)
        .attr('cy', useCase.y)
        .attr('rx', 70)
        .attr('ry', 35)
        .attr('fill', this.colors.usecase)
        .attr('stroke', this.colors.usecaseBorder)
        .attr('stroke-width', 2);

      // Multi-line text
      const lines = useCase.name.split('\n');
      lines.forEach((line, i) => {
        ucGroup.append('text')
          .attr('x', useCase.x)
          .attr('y', useCase.y - 10 + (i * 14))
          .attr('text-anchor', 'middle')
          .attr('font-size', 11)
          .attr('font-weight', '500')
          .attr('fill', '#0f172a')
          .text(line);
      });
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('Use Case Diagram: Smart GMS Features');

    this.addZoomControls(svg, zoom, width, height);

    return svg.node();
  }

  /**
   * Create Interactive PT Session State Machine
   */
  createPTSessionStateDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1000;
    const height = 600;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // State machine for PT Session
    const states = [
      { id: 'created', name: 'CREATED', x: 200, y: 150, color: '#eff6ff', stroke: '#3b82f6', initial: true },
      { id: 'scheduled', name: 'SCHEDULED', x: 500, y: 150, color: '#fff7ed', stroke: '#f59e0b' },
      { id: 'confirmed', name: 'CONFIRMED', x: 800, y: 150, color: '#f0fdf4', stroke: '#10b981' },
      { id: 'in_progress', name: 'IN_PROGRESS', x: 500, y: 300, color: '#ecfdf5', stroke: '#10b981' },
      { id: 'completed', name: 'COMPLETED', x: 500, y: 450, color: '#f5f3ff', stroke: '#8b5cf6', final: true },
      { id: 'cancelled', name: 'CANCELLED', x: 200, y: 450, color: '#fef2f2', stroke: '#ef4444', final: true },
      { id: 'no_show', name: 'NO_SHOW', x: 800, y: 450, color: '#fef2f2', stroke: '#ef4444', final: true }
    ];

    const transitions = [
      { from: 'created', to: 'scheduled', label: 'schedule(date, time)' },
      { from: 'scheduled', to: 'confirmed', label: 'member confirms' },
      { from: 'confirmed', to: 'in_progress', label: 'session starts' },
      { from: 'in_progress', to: 'completed', label: 'session ends' },
      { from: 'created', to: 'cancelled', label: 'cancel early' },
      { from: 'scheduled', to: 'cancelled', label: 'trainer/member cancels' },
      { from: 'confirmed', to: 'cancelled', label: 'late cancel' },
      { from: 'confirmed', to: 'no_show', label: 'member absent' }
    ];

    // Draw transitions with arrows
    transitions.forEach(trans => {
      const fromState = states.find(s => s.id === trans.from);
      const toState = states.find(s => s.id === trans.to);
      
      if (fromState && toState) {
        this.drawTransitionArrow(g, fromState, toState, trans.label);
      }
    });

    // Draw states
    states.forEach(state => {
      const stateGroup = g.append('g')
        .attr('transform', `translate(${state.x}, ${state.y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).select('rect').attr('stroke-width', 4);
          d3.select(this).select('rect').attr('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))');
        })
        .on('mouseleave', function() {
          d3.select(this).select('rect').attr('stroke-width', 3);
          d3.select(this).select('rect').attr('filter', 'none');
        });

      // State box
      stateGroup.append('rect')
        .attr('x', -70)
        .attr('y', -30)
        .attr('width', 140)
        .attr('height', 60)
        .attr('rx', 10)
        .attr('fill', state.color)
        .attr('stroke', state.stroke)
        .attr('stroke-width', 3);

      // State name
      stateGroup.append('text')
        .attr('x', 0)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 'bold')
        .attr('fill', '#0f172a')
        .text(state.name);

      // Initial state indicator
      if (state.initial) {
        g.append('circle')
          .attr('cx', state.x - 120)
          .attr('cy', state.y)
          .attr('r', 8)
          .attr('fill', '#0f172a');

        g.append('line')
          .attr('x1', state.x - 112)
          .attr('y1', state.y)
          .attr('x2', state.x - 80)
          .attr('y2', state.y)
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrowhead)');
      }

      // Final state indicator (double circle)
      if (state.final) {
        stateGroup.append('circle')
          .attr('cx', 0)
          .attr('cy', -50)
          .attr('r', 6)
          .attr('fill', 'none')
          .attr('stroke', state.stroke)
          .attr('stroke-width', 2);

        stateGroup.append('circle')
          .attr('cx', 0)
          .attr('cy', -50)
          .attr('r', 4)
          .attr('fill', state.stroke);
      }
    });

    // Define arrowhead marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', this.colors.gray);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('State Diagram: PT Session Lifecycle');

    this.addZoomControls(svg, zoom, width, height);

    return svg.node();
  }

  /**
   * Helper: Draw entities for ER diagrams
   */
  drawEntities(g, entities) {
    entities.forEach(entity => {
      const entityGroup = g.append('g')
        .attr('transform', `translate(${entity.x}, ${entity.y})`)
        .style('cursor', 'pointer')
        .attr('class', 'entity-group')
        .on('mouseenter', function() {
          d3.select(this).select('.entity-box').attr('stroke-width', 3);
          d3.select(this).attr('transform', `translate(${entity.x}, ${entity.y}) scale(1.02)`);
        })
        .on('mouseleave', function() {
          d3.select(this).select('.entity-box').attr('stroke-width', 2);
          d3.select(this).attr('transform', `translate(${entity.x}, ${entity.y}) scale(1)`);
        });

      const boxWidth = 220;
      const headerHeight = 35;
      const rowHeight = 22;
      const boxHeight = headerHeight + (entity.fields.length * rowHeight);

      // Entity box
      entityGroup.append('rect')
        .attr('class', 'entity-box')
        .attr('x', -boxWidth / 2)
        .attr('y', 0)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('rx', 6)
        .attr('fill', entity.isJunction ? '#fef3c7' : this.colors.entity)
        .attr('stroke', entity.isJunction ? '#f59e0b' : this.colors.entityBorder)
        .attr('stroke-width', 2);

      // Header
      entityGroup.append('rect')
        .attr('x', -boxWidth / 2)
        .attr('y', 0)
        .attr('width', boxWidth)
        .attr('height', headerHeight)
        .attr('rx', 6)
        .attr('fill', entity.isJunction ? '#fbbf24' : this.colors.entityBorder);

      entityGroup.append('text')
        .attr('x', 0)
        .attr('y', headerHeight / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .text(entity.name);

      // Fields
      entity.fields.forEach((field, i) => {
        const y = headerHeight + (i * rowHeight);

        // Field background (highlight PK)
        if (field.key) {
          entityGroup.append('rect')
            .attr('x', -boxWidth / 2 + 1)
            .attr('y', y + 1)
            .attr('width', boxWidth - 2)
            .attr('height', rowHeight)
            .attr('fill', '#fef3c7');
        }

        // Separator line
        entityGroup.append('line')
          .attr('x1', -boxWidth / 2)
          .attr('y1', y)
          .attr('x2', boxWidth / 2)
          .attr('y2', y)
          .attr('stroke', this.colors.border)
          .attr('stroke-width', 1);

        // Key icon
        if (field.key) {
          entityGroup.append('text')
            .attr('x', -boxWidth / 2 + 10)
            .attr('y', y + rowHeight / 2 + 5)
            .attr('font-size', 12)
            .attr('fill', '#f59e0b')
            .text('🔑');
        }

        // Field name
        entityGroup.append('text')
          .attr('x', -boxWidth / 2 + (field.key ? 28 : 10))
          .attr('y', y + rowHeight / 2 + 5)
          .attr('font-size', 11)
          .attr('font-weight', field.key ? 'bold' : 'normal')
          .attr('fill', '#0f172a')
          .text(field.name);

        // Field type
        entityGroup.append('text')
          .attr('x', boxWidth / 2 - 10)
          .attr('y', y + rowHeight / 2 + 5)
          .attr('text-anchor', 'end')
          .attr('font-size', 9)
          .attr('fill', this.colors.gray)
          .text(field.type);
      });
    });
  }

  /**
   * Helper: Draw relationships for ER diagrams
   */
  drawRelationships(g, entities, relationships) {
    relationships.forEach(rel => {
      const fromEntity = entities.find(e => e.id === rel.from);
      const toEntity = entities.find(e => e.id === rel.to);
      
      if (!fromEntity || !toEntity) return;

      const line = g.append('line')
        .attr('x1', fromEntity.x)
        .attr('y1', fromEntity.y)
        .attr('x2', toEntity.x)
        .attr('y2', toEntity.y)
        .attr('stroke', this.colors.gray)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', rel.dashed ? '5,5' : 'none')
        .attr('opacity', 0.5);

      // Label
      const midX = (fromEntity.x + toEntity.x) / 2;
      const midY = (fromEntity.y + toEntity.y) / 2;

      g.append('text')
        .attr('x', midX)
        .attr('y', midY - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', this.colors.gray)
        .attr('background', 'white')
        .text(rel.label);

      // Cardinality indicators
      const cardinalityText = rel.type === 'one-to-many' ? '1:N' : 
                             rel.type === 'many-to-one' ? 'N:1' : 
                             rel.type === 'many-to-many' ? 'N:M' : '1:1';

      g.append('text')
        .attr('x', midX)
        .attr('y', midY + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', 9)
        .attr('font-weight', 'bold')
        .attr('fill', this.colors.relationshipBorder)
        .text(cardinalityText);
    });
  }

  /**
   * Helper: Draw transition arrows for state diagrams
   */
  drawTransitionArrow(g, fromState, toState, label) {
    const line = g.append('line')
      .attr('x1', fromState.x)
      .attr('y1', fromState.y)
      .attr('x2', toState.x)
      .attr('y2', toState.y)
      .attr('stroke', this.colors.gray)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Label background
    const midX = (fromState.x + toState.x) / 2;
    const midY = (fromState.y + toState.y) / 2;

    g.append('rect')
      .attr('x', midX - 60)
      .attr('y', midY - 15)
      .attr('width', 120)
      .attr('height', 20)
      .attr('rx', 4)
      .attr('fill', 'white')
      .attr('stroke', this.colors.border);

    g.append('text')
      .attr('x', midX)
      .attr('y', midY + 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('fill', this.colors.gray)
      .text(label);
  }

  /**
   * Helper: Add legend to ER diagrams
   */
  addERLegend(svg, width, height) {
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${width - 200}, ${height - 100})`);

    legendGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 180)
      .attr('height', 90)
      .attr('rx', 6)
      .attr('fill', 'white')
      .attr('stroke', this.colors.border)
      .attr('stroke-width', 1);

    legendGroup.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('Legend');

    // PK indicator
    legendGroup.append('text')
      .attr('x', 15)
      .attr('y', 40)
      .attr('font-size', 10)
      .text('🔑 Primary Key');

    // Cardinality
    legendGroup.append('text')
      .attr('x', 15)
      .attr('y', 58)
      .attr('font-size', 9)
      .attr('fill', this.colors.gray)
      .text('1:N = One-to-Many');

    legendGroup.append('text')
      .attr('x', 15)
      .attr('y', 73)
      .attr('font-size', 9)
      .attr('fill', this.colors.gray)
      .text('N:M = Many-to-Many');
  }

  /**
   * Helper: Add zoom controls
   */
  addZoomControls(svg, zoom, width, height) {
    const controls = svg.append('g')
      .attr('transform', `translate(${width - 60}, 60)`);

    // Zoom in button
    const zoomIn = controls.append('g')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().call(zoom.scaleBy, 1.3);
      });

    zoomIn.append('circle')
      .attr('r', 20)
      .attr('fill', 'white')
      .attr('stroke', this.colors.border)
      .attr('stroke-width', 2);

    zoomIn.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', this.colors.primary)
      .text('+');

    // Zoom out button
    const zoomOut = controls.append('g')
      .attr('transform', 'translate(0, 50)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().call(zoom.scaleBy, 0.7);
      });

    zoomOut.append('circle')
      .attr('r', 20)
      .attr('fill', 'white')
      .attr('stroke', this.colors.border)
      .attr('stroke-width', 2);

    zoomOut.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', this.colors.primary)
      .text('−');

    // Reset button
    const reset = controls.append('g')
      .attr('transform', 'translate(0, 100)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().call(zoom.transform, d3.zoomIdentity);
      });

    reset.append('circle')
      .attr('r', 20)
      .attr('fill', 'white')
      .attr('stroke', this.colors.border)
      .attr('stroke-width', 2);

    reset.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .attr('font-size', 16)
      .attr('fill', this.colors.primary)
      .text('⟲');
  }

  /**
   * Create Interactive UML Class Diagram
   */
  createUMLClassDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1400;
    const height = 900;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Define UML classes with real entities
    const classes = [
      {
        id: 'user',
        name: 'User',
        stereotype: '<<Entity>>',
        x: 200,
        y: 150,
        attributes: [
          '- userId: Long',
          '- username: String',
          '- email: String',
          '- password: String',
          '- fullName: String',
          '- status: UserStatus'
        ],
        methods: [
          '+ login(): AuthResponse',
          '+ logout(): void',
          '+ updateProfile(): User',
          '+ changePassword(): boolean'
        ]
      },
      {
        id: 'role',
        name: 'Role',
        stereotype: '<<Entity>>',
        x: 550,
        y: 150,
        attributes: [
          '- roleId: Long',
          '- roleName: String'
        ],
        methods: [
          '+ getPermissions(): List<Permission>',
          '+ hasPermission(permission): boolean'
        ]
      },
      {
        id: 'membership',
        name: 'Membership',
        stereotype: '<<Entity>>',
        x: 200,
        y: 450,
        attributes: [
          '- membershipId: Long',
          '- userId: Long',
          '- gymId: Long',
          '- planId: Long',
          '- status: MembershipStatus',
          '- startDate: Date',
          '- endDate: Date',
          '- autoRenew: boolean'
        ],
        methods: [
          '+ activate(): void',
          '+ cancel(): void',
          '+ freeze(days): void',
          '+ isActive(): boolean',
          '+ daysRemaining(): int'
        ]
      },
      {
        id: 'ptsession',
        name: 'PTSession',
        stereotype: '<<Entity>>',
        x: 550,
        y: 450,
        attributes: [
          '- sessionId: Long',
          '- trainerId: Long',
          '- memberId: Long',
          '- sessionDate: LocalDateTime',
          '- status: SessionStatus',
          '- progressNotes: String',
          '- workoutPlan: String'
        ],
        methods: [
          '+ schedule(date): void',
          '+ confirm(): void',
          '+ start(): void',
          '+ complete(): void',
          '+ cancel(): void'
        ]
      },
      {
        id: 'authservice',
        name: 'AuthService',
        stereotype: '<<Service>>',
        x: 900,
        y: 150,
        attributes: [
          '- jwtTokenProvider: JwtTokenProvider',
          '- userRepository: UserRepository',
          '- otpService: OTPService'
        ],
        methods: [
          '+ authenticate(credentials): AuthResponse',
          '+ sendOTP(email): void',
          '+ verifyOTP(otp): boolean',
          '+ generateToken(user): String',
          '+ refreshToken(token): String'
        ]
      },
      {
        id: 'membershipservice',
        name: 'MembershipService',
        stereotype: '<<Service>>',
        x: 900,
        y: 450,
        attributes: [
          '- membershipRepository',
          '- notificationService',
          '- paymentService'
        ],
        methods: [
          '+ createMembership(request): Membership',
          '+ approveMembership(id): void',
          '+ cancelMembership(id): void',
          '+ getActiveMemberships(gymId): List'
        ]
      },
      {
        id: 'auditlogger',
        name: 'AuditLogger',
        stereotype: '<<Component>>',
        x: 1200,
        y: 300,
        attributes: [
          '- auditLogRepository',
          '- asyncExecutor'
        ],
        methods: [
          '+ logAction(action, entity): void',
          '+ logChanges(before, after): void',
          '+ getAuditTrail(entityId): List'
        ]
      }
    ];

    // Define relationships (UML associations)
    const associations = [
      { from: 'user', to: 'role', type: 'association', label: 'has roles', multiplicity: '*' },
      { from: 'user', to: 'membership', type: 'composition', label: 'owns', multiplicity: '1..*' },
      { from: 'user', to: 'ptsession', type: 'association', label: 'trains/attends', multiplicity: '*' },
      { from: 'authservice', to: 'user', type: 'dependency', label: 'uses' },
      { from: 'membershipservice', to: 'membership', type: 'dependency', label: 'manages' },
      { from: 'authservice', to: 'auditlogger', type: 'dependency', label: 'logs to' },
      { from: 'membershipservice', to: 'auditlogger', type: 'dependency', label: 'logs to' }
    ];

    // Draw associations
    associations.forEach(assoc => {
      const fromClass = classes.find(c => c.id === assoc.from);
      const toClass = classes.find(c => c.id === assoc.to);
      
      if (fromClass && toClass) {
        this.drawUMLAssociation(g, fromClass, toClass, assoc);
      }
    });

    // Draw classes
    classes.forEach(cls => {
      this.drawUMLClass(g, cls);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('UML Class Diagram: Core Domain Model');

    this.addZoomControls(svg, zoom, width, height);

    return svg.node();
  }

  /**
   * Create Interactive System Architecture Diagram (Layered)
   */
  createArchitectureDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1200;
    const height = 800;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Define architecture layers
    const layers = [
      {
        name: 'Presentation Layer',
        y: 100,
        color: '#eff6ff',
        stroke: '#3b82f6',
        components: [
          { name: 'React UI', desc: 'Components, Pages, Hooks' },
          { name: 'Redux Store', desc: 'State Management' },
          { name: 'React Router', desc: 'Navigation' },
          { name: 'Axios HTTP', desc: 'API Client' }
        ]
      },
      {
        name: 'API Gateway Layer',
        y: 250,
        color: '#fff7ed',
        stroke: '#f59e0b',
        components: [
          { name: 'Spring Boot', desc: 'REST Controllers' },
          { name: 'JWT Filter', desc: 'Authentication' },
          { name: 'CORS Config', desc: 'Security' },
          { name: 'Exception Handler', desc: 'Error Management' }
        ]
      },
      {
        name: 'Business Logic Layer',
        y: 400,
        color: '#f0fdf4',
        stroke: '#10b981',
        components: [
          { name: 'Services', desc: 'Business Rules' },
          { name: 'DTOs', desc: 'Data Transfer' },
          { name: 'Validators', desc: 'Input Validation' },
          { name: 'Mappers', desc: 'Entity Mapping' }
        ]
      },
      {
        name: 'Data Access Layer',
        y: 550,
        color: '#f5f3ff',
        stroke: '#8b5cf6',
        components: [
          { name: 'JPA Repositories', desc: 'Data Access' },
          { name: 'Entity Models', desc: '30+ Entities' },
          { name: 'Query Methods', desc: 'Custom Queries' },
          { name: 'Transactions', desc: '@Transactional' }
        ]
      },
      {
        name: 'Database Layer',
        y: 700,
        color: '#fef2f2',
        stroke: '#ef4444',
        components: [
          { name: 'Oracle DB', desc: 'Production Database' },
          { name: 'Connection Pool', desc: 'HikariCP' },
          { name: 'Migrations', desc: 'Flyway' },
          { name: 'Backup System', desc: 'Automated' }
        ]
      }
    ];

    // Draw layers
    layers.forEach((layer, index) => {
      // Layer background
      const layerGroup = g.append('g')
        .attr('class', `layer-${index}`)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).select('.layer-box').attr('stroke-width', 4);
          d3.select(this).select('.layer-box').attr('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))');
        })
        .on('mouseleave', function() {
          d3.select(this).select('.layer-box').attr('stroke-width', 3);
          d3.select(this).select('.layer-box').attr('filter', 'none');
        });

      layerGroup.append('rect')
        .attr('class', 'layer-box')
        .attr('x', 50)
        .attr('y', layer.y)
        .attr('width', width - 100)
        .attr('height', 120)
        .attr('rx', 10)
        .attr('fill', layer.color)
        .attr('stroke', layer.stroke)
        .attr('stroke-width', 3);

      // Layer title
      layerGroup.append('text')
        .attr('x', width / 2)
        .attr('y', layer.y + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('fill', '#0f172a')
        .text(layer.name);

      // Components
      const componentWidth = 250;
      const componentSpacing = 30;
      const totalWidth = (componentWidth * layer.components.length) + (componentSpacing * (layer.components.length - 1));
      const startX = (width - totalWidth) / 2;

      layer.components.forEach((comp, i) => {
        const compX = startX + (i * (componentWidth + componentSpacing));
        const compY = layer.y + 45;

        const compGroup = layerGroup.append('g')
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            d3.select(this).select('rect').attr('fill', 'white');
            d3.select(this).select('rect').attr('stroke-width', 3);
          })
          .on('mouseleave', function() {
            d3.select(this).select('rect').attr('fill', '#ffffff');
            d3.select(this).select('rect').attr('stroke-width', 2);
          });

        compGroup.append('rect')
          .attr('x', compX)
          .attr('y', compY)
          .attr('width', componentWidth)
          .attr('height', 60)
          .attr('rx', 6)
          .attr('fill', '#ffffff')
          .attr('stroke', layer.stroke)
          .attr('stroke-width', 2);

        compGroup.append('text')
          .attr('x', compX + componentWidth / 2)
          .attr('y', compY + 25)
          .attr('text-anchor', 'middle')
          .attr('font-size', 13)
          .attr('font-weight', 'bold')
          .attr('fill', '#0f172a')
          .text(comp.name);

        compGroup.append('text')
          .attr('x', compX + componentWidth / 2)
          .attr('y', compY + 45)
          .attr('text-anchor', 'middle')
          .attr('font-size', 10)
          .attr('fill', this.colors.gray)
          .text(comp.desc);
      });

      // Draw connection to next layer
      if (index < layers.length - 1) {
        g.append('line')
          .attr('x1', width / 2)
          .attr('y1', layer.y + 120)
          .attr('x2', width / 2)
          .attr('y2', layers[index + 1].y)
          .attr('stroke', this.colors.gray)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('marker-end', 'url(#arrowhead-arch)');
      }
    });

    // Define arrowhead
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead-arch')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', this.colors.gray);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('System Architecture: 5-Layer Design');

    this.addZoomControls(svg, zoom, width, height);

    return svg.node();
  }

  /**
   * Helper: Draw UML class box
   */
  drawUMLClass(g, cls) {
    const boxWidth = 240;
    const headerHeight = 45;
    const sectionHeight = 25;
    const attributeHeight = cls.attributes.length * 18 + 10;
    const methodHeight = cls.methods.length * 18 + 10;
    const totalHeight = headerHeight + attributeHeight + methodHeight + 30;

    const classGroup = g.append('g')
      .attr('transform', `translate(${cls.x}, ${cls.y})`)
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).select('.class-box').attr('stroke-width', 3);
        d3.select(this).attr('transform', `translate(${cls.x}, ${cls.y}) scale(1.02)`);
      })
      .on('mouseleave', function() {
        d3.select(this).select('.class-box').attr('stroke-width', 2);
        d3.select(this).attr('transform', `translate(${cls.x}, ${cls.y}) scale(1)`);
      });

    // Main box
    classGroup.append('rect')
      .attr('class', 'class-box')
      .attr('x', -boxWidth / 2)
      .attr('y', 0)
      .attr('width', boxWidth)
      .attr('height', totalHeight)
      .attr('rx', 6)
      .attr('fill', cls.stereotype.includes('Service') ? '#fff7ed' : 
                    cls.stereotype.includes('Component') ? '#f0fdf4' : '#eff6ff')
      .attr('stroke', cls.stereotype.includes('Service') ? '#f59e0b' : 
                      cls.stereotype.includes('Component') ? '#10b981' : '#3b82f6')
      .attr('stroke-width', 2);

    // Stereotype
    classGroup.append('text')
      .attr('x', 0)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-style', 'italic')
      .attr('fill', this.colors.gray)
      .text(cls.stereotype);

    // Class name
    classGroup.append('text')
      .attr('x', 0)
      .attr('y', 38)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text(cls.name);

    // Separator line after header
    classGroup.append('line')
      .attr('x1', -boxWidth / 2)
      .attr('y1', headerHeight)
      .attr('x2', boxWidth / 2)
      .attr('y2', headerHeight)
      .attr('stroke', this.colors.border)
      .attr('stroke-width', 1.5);

    // Attributes
    cls.attributes.forEach((attr, i) => {
      classGroup.append('text')
        .attr('x', -boxWidth / 2 + 10)
        .attr('y', headerHeight + 20 + (i * 18))
        .attr('font-size', 10)
        .attr('font-family', 'monospace')
        .attr('fill', '#0f172a')
        .text(attr);
    });

    // Separator line before methods
    const methodsY = headerHeight + attributeHeight + 10;
    classGroup.append('line')
      .attr('x1', -boxWidth / 2)
      .attr('y1', methodsY)
      .attr('x2', boxWidth / 2)
      .attr('y2', methodsY)
      .attr('stroke', this.colors.border)
      .attr('stroke-width', 1.5);

    // Methods
    cls.methods.forEach((method, i) => {
      classGroup.append('text')
        .attr('x', -boxWidth / 2 + 10)
        .attr('y', methodsY + 18 + (i * 18))
        .attr('font-size', 10)
        .attr('font-family', 'monospace')
        .attr('fill', '#0f172a')
        .text(method);
    });
  }

  /**
   * Helper: Draw UML association
   */
  drawUMLAssociation(g, fromClass, toClass, assoc) {
    const line = g.append('line')
      .attr('x1', fromClass.x)
      .attr('y1', fromClass.y + 100)
      .attr('x2', toClass.x)
      .attr('y2', toClass.y + 100)
      .attr('stroke', this.colors.gray)
      .attr('stroke-width', assoc.type === 'composition' ? 3 : 
                          assoc.type === 'dependency' ? 1.5 : 2)
      .attr('stroke-dasharray', assoc.type === 'dependency' ? '5,5' : 'none');

    // Label
    const midX = (fromClass.x + toClass.x) / 2;
    const midY = (fromClass.y + toClass.y + 200) / 2;

    g.append('rect')
      .attr('x', midX - 40)
      .attr('y', midY - 12)
      .attr('width', 80)
      .attr('height', 16)
      .attr('rx', 3)
      .attr('fill', 'white')
      .attr('stroke', this.colors.border);

    g.append('text')
      .attr('x', midX)
      .attr('y', midY + 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('fill', this.colors.gray)
      .text(assoc.label);

    // Multiplicity
    if (assoc.multiplicity) {
      g.append('text')
        .attr('x', toClass.x - 20)
        .attr('y', toClass.y + 90)
        .attr('font-size', 10)
        .attr('font-weight', 'bold')
        .attr('fill', this.colors.relationshipBorder)
        .text(assoc.multiplicity);
    }
  }

  /**
   * Fig 2-1: Feature Comparison Bar Chart
   * Compares Smart GMS vs 3 competitors on 8 features
   */
  createFeatureComparisonChart(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1040;
    const height = 400;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.8, 2])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Data extracted from original diagram
    const features = [
      'Multi-Role Auth',
      'Real-Time Chat',
      'Progress Tracking',
      'Analytics',
      'API Access',
      'Open Source',
      'Custom Branding',
      '2FA Security'
    ];

    const products = [
      { name: 'Smart GMS', color: ['#60a5fa', '#2563eb'], id: 'b1' },
      { name: 'Mindbody', color: ['#fbbf24', '#d97706'], id: 'b2' },
      { name: 'Zen Planner', color: ['#34d399', '#059669'], id: 'b3' },
      { name: 'GymMaster', color: ['#a78bfa', '#7c3aed'], id: 'b4' }
    ];

    // Scores for each product per feature (0-10 scale)
    const data = [
      [10, 10, 10, 10, 10, 10, 10, 10], // Smart GMS
      [9, 5, 7, 9, 5, 0, 6, 7],          // Mindbody
      [8, 6, 6, 8, 6, 0, 6, 5],          // Zen Planner
      [8, 7, 7, 8, 7, 0, 5, 7]           // GymMaster
    ];

    // Define gradients
    const defs = svg.append('defs');
    products.forEach(product => {
      const gradient = defs.append('linearGradient')
        .attr('id', product.id)
        .attr('x1', '0')
        .attr('y1', '0')
        .attr('x2', '0')
        .attr('y2', '1');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', product.color[0]);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', product.color[1]);
    });

    // Chart area
    const chartX = 95;
    const chartY = 50;
    const chartWidth = 860;
    const chartHeight = 200;
    const barWidth = 14;
    const groupSpacing = 92;

    // Background
    g.append('rect')
      .attr('x', 65)
      .attr('y', 30)
      .attr('width', 920)
      .attr('height', 250)
      .attr('rx', 12)
      .attr('fill', '#ffffff')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1.5);

    // Y-axis
    g.append('line')
      .attr('x1', chartX)
      .attr('y1', chartY)
      .attr('x2', chartX)
      .attr('y2', chartY + chartHeight)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2);

    // X-axis
    g.append('line')
      .attr('x1', chartX)
      .attr('y1', chartY + chartHeight)
      .attr('x2', chartX + chartWidth)
      .attr('y2', chartY + chartHeight)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2);

    // Y-axis labels
    for (let i = 0; i <= 10; i += 2) {
      const y = chartY + chartHeight - (i * chartHeight / 10);
      
      // Grid line
      g.append('line')
        .attr('x1', chartX)
        .attr('y1', y)
        .attr('x2', chartX + chartWidth)
        .attr('y2', y)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);

      // Label
      g.append('text')
        .attr('x', chartX - 8)
        .attr('y', y + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', 11)
        .attr('fill', '#94a3b8')
        .text(i);
    }

    // Draw bars
    features.forEach((feature, featureIdx) => {
      const baseX = chartX + 40 + (featureIdx * groupSpacing);
      
      products.forEach((product, productIdx) => {
        const score = data[productIdx][featureIdx];
        const barHeight = (score / 10) * chartHeight;
        const barX = baseX + (productIdx * (barWidth + 2));
        const barY = chartY + chartHeight - barHeight;

        const bar = g.append('rect')
          .attr('x', barX)
          .attr('y', barY)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('rx', 3)
          .attr('fill', `url(#${product.id})`)
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            d3.select(this)
              .attr('fill-opacity', 0.8)
              .attr('stroke', product.color[1])
              .attr('stroke-width', 2);
            
            // Show tooltip
            g.append('text')
              .attr('class', 'tooltip-text')
              .attr('x', barX + barWidth / 2)
              .attr('y', barY - 8)
              .attr('text-anchor', 'middle')
              .attr('font-size', 12)
              .attr('font-weight', 'bold')
              .attr('fill', product.color[1])
              .text(score);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .attr('fill-opacity', 1)
              .attr('stroke', 'none');
            g.selectAll('.tooltip-text').remove();
          });
      });

      // Feature label
      g.append('text')
        .attr('x', baseX + 28)
        .attr('y', chartY + chartHeight + 42)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('fill', '#334155')
        .text(feature);
    });

    // Legend
    const legendY = 314;
    const legendSpacing = 130;
    
    products.forEach((product, idx) => {
      const legendX = 80 + (idx * legendSpacing);
      
      g.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', `url(#${product.id})`);

      g.append('text')
        .attr('x', legendX + 18)
        .attr('y', legendY + 10)
        .attr('font-size', 10)
        .attr('fill', '#64748b')
        .text(product.name);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('Feature Depth Comparison — Smart GMS vs Market Competitors');

    this.addZoomControls(svg, zoom, width, height);

    return svg.node();
  }

  /**
   * Fig 2-3: Feature Coverage Distribution Pie Chart
   */
  createCoverageDistribution(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 800;
    const height = 500;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Data: Overall feature coverage
    const data = [
      { label: 'Smart GMS', value: 100, color: ['#60a5fa', '#2563eb'] },
      { label: 'Mindbody', value: 76, color: ['#fbbf24', '#d97706'] },
      { label: 'Zen Planner', value: 69, color: ['#34d399', '#059669'] },
      { label: 'GymMaster', value: 74, color: ['#a78bfa', '#7c3aed'] }
    ];

    // Calculate percentages
    const total = data.reduce((sum, d) => sum + d.value, 0);
    data.forEach(d => d.percentage = (d.value / total * 100).toFixed(1));

    // Define gradients
    const defs = svg.append('defs');
    data.forEach((d, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `pie-grad-${i}`)
        .attr('x1', '0')
        .attr('y1', '0')
        .attr('x2', '1')
        .attr('y2', '1');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d.color[0]);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.color[1]);
    });

    // Create pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(150);

    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(160);

    // Draw slices
    const slices = g.selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => `url(#pie-grad-${i})`)
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
      });

    // Add labels
    slices.append('text')
      .attr('transform', d => {
        const [x, y] = arc.centroid(d);
        return `translate(${x * 1.6}, ${y * 1.6})`;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text(d => d.data.label);

    // Add percentages
    slices.append('text')
      .attr('transform', d => {
        const [x, y] = arc.centroid(d);
        return `translate(${x * 1.6}, ${y * 1.6 + 16})`;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('fill', '#2563eb')
      .text(d => `${d.data.percentage}%`);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('Overall Feature Coverage Distribution Across Platforms');

    return svg.node();
  }

  /**
   * ========================================
   * DATA FLOW DIAGRAMS (DFD)
   * ========================================
   */

  /**
   * DFD Level 0: Context Diagram
   */
  createDFDLevel0(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1200;
    const height = 600;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    // Add gradient definitions
    const defs = g.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'systemGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#8b5cf6');

    // External actors (circles)
    const actors = [
      { id: 'member', label: 'Member', x: 150, y: 150 },
      { id: 'trainer', label: 'Trainer', x: 150, y: 300 },
      { id: 'owner', label: 'Owner', x: 150, y: 450 },
      { id: 'payment', label: 'Payment\nGateway', x: 1050, y: 200 },
      { id: 'email', label: 'Email\nService', x: 1050, y: 400 }
    ];

    // Central system
    const system = { x: 600, y: 300, width: 300, height: 120 };

    // Draw data flows
    const flows = [
      { from: actors[0], to: system, label: 'Register, Book' },
      { from: system, to: actors[0], label: 'Dashboard, Notify' },
      { from: actors[1], to: system, label: 'Sessions, Notes' },
      { from: system, to: actors[1], label: 'Schedule, Data' },
      { from: actors[2], to: system, label: 'Config, Staff' },
      { from: system, to: actors[2], label: 'Analytics, Reports' },
      { from: system, to: actors[3], label: 'Pay Request' },
      { from: actors[3], to: system, label: 'Status' },
      { from: system, to: actors[4], label: 'Emails' },
      { from: actors[4], to: system, label: 'Delivery' }
    ];

    // Draw arrows
    flows.forEach(flow => {
      const fromX = flow.from.x !== undefined ? flow.from.x : flow.from.x + flow.from.width / 2;
      const fromY = flow.from.y !== undefined ? flow.from.y : flow.from.y + flow.from.height / 2;
      const toX = flow.to.x !== undefined ? flow.to.x : flow.to.x + flow.to.width / 2;
      const toY = flow.to.y !== undefined ? flow.to.y : flow.to.y + flow.to.height / 2;

      g.append('line')
        .attr('x1', fromX)
        .attr('y1', fromY)
        .attr('x2', toX)
        .attr('y2', toY)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)');

      // Flow label
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      g.append('text')
        .attr('x', midX)
        .attr('y', midY - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('fill', '#475569')
        .text(flow.label);
    });

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#94a3b8');

    // Draw actors (circles)
    actors.forEach(actor => {
      g.append('circle')
        .attr('cx', actor.x)
        .attr('cy', actor.y)
        .attr('r', 50)
        .attr('fill', '#fef3c7')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', actor.x)
        .attr('y', actor.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 'bold')
        .attr('fill', '#78350f')
        .selectAll('tspan')
        .data(actor.label.split('\n'))
        .enter()
        .append('tspan')
        .attr('x', actor.x)
        .attr('dy', (d, i) => i === 0 ? 0 : 14)
        .text(d => d);
    });

    // Draw central system
    g.append('rect')
      .attr('x', system.x)
      .attr('y', system.y)
      .attr('width', system.width)
      .attr('height', system.height)
      .attr('fill', 'url(#systemGradient)')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 3)
      .attr('rx', 10);

    g.append('text')
      .attr('x', system.x + system.width / 2)
      .attr('y', system.y + system.height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text('Gym Management');

    g.append('text')
      .attr('x', system.x + system.width / 2)
      .attr('y', system.y + system.height / 2 + 22)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text('System');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('DFD Level 0: Context Diagram');

    return svg.node();
  }

  /**
   * DFD Level 1: Main Processes
   */
  createDFDLevel1(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1400;
    const height = 800;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    // Define actors
    const actors = [
      { id: 'member', label: 'Member', x: 100, y: 200 },
      { id: 'trainer', label: 'Trainer', x: 100, y: 400 },
      { id: 'owner', label: 'Owner', x: 100, y: 600 }
    ];

    // Define processes (circles with numbers)
    const processes = [
      { id: 'p1', num: '1.0', label: 'Auth', x: 400, y: 200 },
      { id: 'p2', num: '2.0', label: 'Membership', x: 600, y: 200 },
      { id: 'p3', num: '3.0', label: 'Training', x: 800, y: 200 },
      { id: 'p4', num: '4.0', label: 'Chat', x: 400, y: 400 },
      { id: 'p5', num: '5.0', label: 'Analytics', x: 600, y: 400 },
      { id: 'p6', num: '6.0', label: 'Admin', x: 800, y: 400 }
    ];

    // Define data stores
    const dataStores = [
      { id: 'd1', label: 'Users', x: 400, y: 600 },
      { id: 'd2', label: 'Members', x: 600, y: 600 },
      { id: 'd3', label: 'Sessions', x: 800, y: 600 },
      { id: 'd4', label: 'Messages', x: 1000, y: 600 }
    ];

    // Define connections
    const connections = [
      { from: actors[0], to: processes[0] },
      { from: actors[1], to: processes[0] },
      { from: actors[2], to: processes[0] },
      { from: processes[0], to: dataStores[0] },
      { from: actors[0], to: processes[1] },
      { from: processes[1], to: dataStores[1] },
      { from: actors[0], to: processes[2] },
      { from: actors[1], to: processes[2] },
      { from: processes[2], to: dataStores[2] },
      { from: actors[0], to: processes[3] },
      { from: actors[1], to: processes[3] },
      { from: processes[3], to: dataStores[3] },
      { from: actors[2], to: processes[4] },
      { from: actors[2], to: processes[5] }
    ];

    // Draw connections
    connections.forEach(conn => {
      g.append('line')
        .attr('x1', conn.from.x)
        .attr('y1', conn.from.y)
        .attr('x2', conn.to.x)
        .attr('y2', conn.to.y)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2);
    });

    // Draw actors
    actors.forEach(actor => {
      g.append('circle')
        .attr('cx', actor.x)
        .attr('cy', actor.y)
        .attr('r', 45)
        .attr('fill', '#fef3c7')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', actor.x)
        .attr('y', actor.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 'bold')
        .attr('fill', '#78350f')
        .text(actor.label);
    });

    // Draw processes
    processes.forEach(proc => {
      g.append('circle')
        .attr('cx', proc.x)
        .attr('cy', proc.y)
        .attr('r', 60)
        .attr('fill', '#dbeafe')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 3);

      g.append('text')
        .attr('x', proc.x)
        .attr('y', proc.y - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('fill', '#1e40af')
        .text(proc.num);

      g.append('text')
        .attr('x', proc.x)
        .attr('y', proc.y + 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', 13)
        .attr('fill', '#1e3a8a')
        .text(proc.label);
    });

    // Draw data stores
    dataStores.forEach(store => {
      g.append('rect')
        .attr('x', store.x - 70)
        .attr('y', store.y - 25)
        .attr('width', 140)
        .attr('height', 50)
        .attr('fill', '#f0fdf4')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('rx', 5);

      // Left edge line
      g.append('line')
        .attr('x1', store.x - 60)
        .attr('y1', store.y - 25)
        .attr('x2', store.x - 60)
        .attr('y2', store.y + 25)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', store.x)
        .attr('y', store.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 'bold')
        .attr('fill', '#065f46')
        .text(store.label);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('DFD Level 1: Main Processes');

    return svg.node();
  }

  /**
   * DFD Level 2.1: Authentication Sub-Process
   */
  createDFDLevel2Auth(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1200;
    const height = 700;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    // Actors
    const actors = [
      { id: 'user', label: 'User', x: 100, y: 250 },
      { id: 'oauth', label: 'OAuth', x: 100, y: 450 }
    ];

    // Sub-processes
    const processes = [
      { id: 'v', label: 'Validate\nCredentials', x: 350, y: 250 },
      { id: 'h', label: 'OAuth\nHandler', x: 350, y: 450 },
      { id: 'r', label: 'Assign\nRoles', x: 600, y: 350 },
      { id: 'tfa', label: '2FA\nVerify', x: 850, y: 350 },
      { id: 'jwt', label: 'JWT\nGenerator', x: 1050, y: 350 }
    ];

    // Data stores
    const dataStores = [
      { id: 'd1', label: 'Users', x: 350, y: 100 },
      { id: 'd2', label: 'Roles', x: 600, y: 150 },
      { id: 'd3', label: 'OTP', x: 850, y: 150 }
    ];

    // Draw connections
    const connections = [
      { from: actors[0], to: processes[0] },
      { from: actors[1], to: processes[1] },
      { from: processes[0], to: dataStores[0] },
      { from: processes[1], to: processes[0] },
      { from: processes[0], to: processes[2] },
      { from: processes[2], to: dataStores[1] },
      { from: processes[2], to: processes[3] },
      { from: processes[3], to: dataStores[2] },
      { from: processes[3], to: processes[4] },
      { from: processes[4], to: actors[0] }
    ];

    connections.forEach(conn => {
      g.append('line')
        .attr('x1', conn.from.x)
        .attr('y1', conn.from.y)
        .attr('x2', conn.to.x)
        .attr('y2', conn.to.y)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow-auth)');
    });

    // Arrow marker
    const defs = g.append('defs');
    defs.append('marker')
      .attr('id', 'arrow-auth')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#94a3b8');

    // Draw actors
    actors.forEach(actor => {
      g.append('circle')
        .attr('cx', actor.x)
        .attr('cy', actor.y)
        .attr('r', 45)
        .attr('fill', '#fef3c7')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', actor.x)
        .attr('y', actor.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 'bold')
        .attr('fill', '#78350f')
        .text(actor.label);
    });

    // Draw processes
    processes.forEach(proc => {
      g.append('circle')
        .attr('cx', proc.x)
        .attr('cy', proc.y)
        .attr('r', 55)
        .attr('fill', '#dbeafe')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 3);

      const lines = proc.label.split('\n');
      lines.forEach((line, i) => {
        g.append('text')
          .attr('x', proc.x)
          .attr('y', proc.y + (i - lines.length / 2 + 0.5) * 15)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', 12)
          .attr('font-weight', 'bold')
          .attr('fill', '#1e40af')
          .text(line);
      });
    });

    // Draw data stores
    dataStores.forEach(store => {
      g.append('rect')
        .attr('x', store.x - 60)
        .attr('y', store.y - 25)
        .attr('width', 120)
        .attr('height', 50)
        .attr('fill', '#f0fdf4')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('rx', 5);

      g.append('line')
        .attr('x1', store.x - 50)
        .attr('y1', store.y - 25)
        .attr('x2', store.x - 50)
        .attr('y2', store.y + 25)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', store.x)
        .attr('y', store.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 'bold')
        .attr('fill', '#065f46')
        .text(store.label);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('DFD Level 2.1: Authentication Sub-Process (Process 1.0)');

    return svg.node();
  }

  // Continue with more DFD diagrams...
  // (Membership, Training, Communication, Analytics sub-processes)
  // For brevity, I'll add placeholder methods that can be expanded

  createDFDLevel2Membership(containerId) {
    // Similar structure to Auth DFD
    return this._createGenericDFD(containerId, {
      title: 'DFD Level 2.2: Membership Sub-Process (Process 2.0)',
      actors: [
        { id: 'member', label: 'Member', x: 100, y: 200 },
        { id: 'owner', label: 'Owner', x: 100, y: 400 },
        { id: 'payment', label: 'Payment', x: 100, y: 600 }
      ],
      processes: [
        { id: 'browse', label: 'Browse\nPackages', x: 350, y: 200 },
        { id: 'create', label: 'Create\nRequest', x: 600, y: 300 },
        { id: 'process', label: 'Process\nPayment', x: 350, y: 600 },
        { id: 'approve', label: 'Approve\nMember', x: 850, y: 400 },
        { id: 'activate', label: 'Activate\nAccess', x: 1050, y: 300 }
      ],
      dataStores: [
        { id: 'd1', label: 'Packages', x: 350, y: 80 },
        { id: 'd2', label: 'Memberships', x: 850, y: 180 },
        { id: 'd3', label: 'Transactions', x: 600, y: 550 }
      ]
    });
  }

  createDFDLevel2Training(containerId) {
    return this._createGenericDFD(containerId, {
      title: 'DFD Level 2.3: Training Sub-Process (Process 3.0)',
      actors: [
        { id: 'member', label: 'Member', x: 100, y: 250 },
        { id: 'trainer', label: 'Trainer', x: 100, y: 500 }
      ],
      processes: [
        { id: 'discover', label: 'Discover\nTrainers', x: 350, y: 250 },
        { id: 'book', label: 'Book\nSession', x: 600, y: 200 },
        { id: 'check', label: 'Check\nAvailability', x: 600, y: 400 },
        { id: 'execute', label: 'Execute\nSession', x: 850, y: 500 },
        { id: 'track', label: 'Track\nProgress', x: 1050, y: 400 },
        { id: 'rate', label: 'Rate\nSession', x: 850, y: 150 }
      ],
      dataStores: [
        { id: 'd1', label: 'Trainers', x: 350, y: 80 },
        { id: 'd2', label: 'Sessions', x: 850, y: 250 },
        { id: 'd3', label: 'Progress', x: 1050, y: 200 },
        { id: 'd4', label: 'Ratings', x: 850, y: 50 }
      ]
    });
  }

  createDFDLevel2Communication(containerId) {
    return this._createGenericDFD(containerId, {
      title: 'DFD Level 2.4: Communication Sub-Process (Process 4.0)',
      actors: [
        { id: 'user1', label: 'User 1', x: 100, y: 250 },
        { id: 'user2', label: 'User 2', x: 1100, y: 450 }
      ],
      processes: [
        { id: 'conv', label: 'Conversation\nManager', x: 350, y: 250 },
        { id: 'msg', label: 'Message\nHandler', x: 600, y: 350 },
        { id: 'attach', label: 'Attachment\nProcessor', x: 850, y: 250 },
        { id: 'ws', label: 'WebSocket\nBroadcast', x: 850, y: 450 },
        { id: 'notify', label: 'Notification\nService', x: 600, y: 550 }
      ],
      dataStores: [
        { id: 'd1', label: 'Conversations', x: 350, y: 100 },
        { id: 'd2', label: 'Messages', x: 600, y: 150 },
        { id: 'd3', label: 'Files', x: 850, y: 100 },
        { id: 'd4', label: 'Notifications', x: 600, y: 650 }
      ]
    });
  }

  createDFDLevel2Analytics(containerId) {
    return this._createGenericDFD(containerId, {
      title: 'DFD Level 2.5: Analytics Sub-Process (Process 5.0)',
      actors: [
        { id: 'owner', label: 'Owner', x: 100, y: 300 },
        { id: 'trainer', label: 'Trainer', x: 1100, y: 450 }
      ],
      processes: [
        { id: 'agg', label: 'Data\nAggregator', x: 350, y: 400 },
        { id: 'revenue', label: 'Revenue\nCalculator', x: 600, y: 250 },
        { id: 'stats', label: 'Member\nStatistics', x: 600, y: 400 },
        { id: 'perf', label: 'Trainer\nPerformance', x: 600, y: 550 },
        { id: 'report', label: 'Report\nGenerator', x: 850, y: 300 }
      ],
      dataStores: [
        { id: 'd1', label: 'Transactions', x: 350, y: 150 },
        { id: 'd2', label: 'Memberships', x: 350, y: 250 },
        { id: 'd3', label: 'Sessions', x: 350, y: 550 },
        { id: 'd4', label: 'Cache', x: 1050, y: 300 }
      ]
    });
  }

  /**
   * ========================================
   * ADDITIONAL ER DIAGRAMS
   * ========================================
   */

  /**
   * ER Diagram: Training & Session Entities (Fig 5-3)
   */
  createTrainingERDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1400;
    const height = 700;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    // Define entities with ID
    const entities = [
      {
        id: 'trainer_assign',
        name: 'TRAINER_ASSIGNMENTS',
        x: 200,
        y: 200,
        fields: [
          { name: 'id', type: 'BIGINT PK', key: true },
          { name: 'trainer_id', type: 'FK → User' },
          { name: 'member_id', type: 'FK → User' },
          { name: 'status', type: 'VARCHAR(20)' },
          { name: 'assigned_date', type: 'TIMESTAMP' }
        ]
      },
      {
        id: 'pt_session',
        name: 'PT_SESSIONS',
        x: 700,
        y: 200,
        fields: [
          { name: 'session_id', type: 'BIGINT PK', key: true },
          { name: 'trainer_id', type: 'FK → User' },
          { name: 'member_id', type: 'FK → User' },
          { name: 'gym_id', type: 'FK → Gym' },
          { name: 'session_date', type: 'TIMESTAMP' },
          { name: 'duration', type: 'INT' },
          { name: 'status', type: 'VARCHAR(20)' },
          { name: 'notes', type: 'CLOB' }
        ]
      },
      {
        id: 'session_rating',
        name: 'SESSION_RATINGS',
        x: 1100,
        y: 200,
        fields: [
          { name: 'rating_id', type: 'BIGINT PK', key: true },
          { name: 'session_id', type: 'FK → PT_SESSION' },
          { name: 'rating', type: 'INT (1-5)' },
          { name: 'feedback', type: 'CLOB' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      {
        id: 'progress',
        name: 'PROGRESS_TRACKING',
        x: 700,
        y: 500,
        fields: [
          { name: 'progress_id', type: 'BIGINT PK', key: true },
          { name: 'member_id', type: 'FK → User' },
          { name: 'date', type: 'DATE' },
          { name: 'weight', type: 'DECIMAL(5,2)' },
          { name: 'body_fat_pct', type: 'DECIMAL(4,2)' },
          { name: 'notes', type: 'CLOB' }
        ]
      }
    ];

    // Draw entities
    this.drawEntities(g, entities);

    // Draw relationships using proper format
    const relationships = [
      { from: 'trainer_assign', to: 'pt_session', type: 'one-to-many', label: 'schedules' },
      { from: 'pt_session', to: 'session_rating', type: 'one-to-one', label: 'rated by' },
      { from: 'pt_session', to: 'progress', type: 'one-to-many', label: 'tracks' }
    ];

    this.drawRelationships(g, entities, relationships);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('ER Diagram: Training & Session Entities');

    return svg.node();
  }

  /**
   * ER Diagram: Communication Entities (Fig 5-4)
   */
  createCommunicationERDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1400;
    const height = 800;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    const entities = [
      {
        id: 'conversation',
        name: 'CONVERSATIONS',
        x: 300,
        y: 250,
        fields: [
          { name: 'conversation_id', type: 'BIGINT PK', key: true },
          { name: 'name', type: 'VARCHAR(255)' },
          { name: 'is_group', type: 'BOOLEAN' },
          { name: 'created_by', type: 'FK → User' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      {
        id: 'conv_participants',
        name: 'CONVERSATION_PARTICIPANTS',
        x: 300,
        y: 550,
        fields: [
          { name: 'conversation_id', type: 'FK PK', key: true },
          { name: 'user_id', type: 'FK PK', key: true },
          { name: 'joined_at', type: 'TIMESTAMP' }
        ],
        isJunction: true
      },
      {
        id: 'message',
        name: 'MESSAGES',
        x: 750,
        y: 250,
        fields: [
          { name: 'message_id', type: 'BIGINT PK', key: true },
          { name: 'conversation_id', type: 'FK → Conversation' },
          { name: 'sender_id', type: 'FK → User' },
          { name: 'content', type: 'CLOB' },
          { name: 'is_edited', type: 'BOOLEAN' },
          { name: 'is_deleted', type: 'BOOLEAN' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      {
        id: 'message_attach',
        name: 'MESSAGE_ATTACHMENTS',
        x: 1100,
        y: 250,
        fields: [
          { name: 'attachment_id', type: 'BIGINT PK', key: true },
          { name: 'message_id', type: 'FK → Message' },
          { name: 'file_url', type: 'VARCHAR(500)' },
          { name: 'file_type', type: 'VARCHAR(50)' },
          { name: 'file_size', type: 'BIGINT' }
        ]
      }
    ];

    this.drawEntities(g, entities);

    const relationships = [
      { from: 'conversation', to: 'conv_participants', type: 'one-to-many', label: 'has' },
      { from: 'conversation', to: 'message', type: 'one-to-many', label: 'contains' },
      { from: 'message', to: 'message_attach', type: 'one-to-many', label: 'has' }
    ];

    this.drawRelationships(g, entities, relationships);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('ER Diagram: Communication & Messaging Entities');

    return svg.node();
  }

  /**
   * ER Diagram: Notification Entities (Fig 5-5)
   */
  createNotificationERDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1200;
    const height = 600;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    const entities = [
      {
        id: 'notification',
        name: 'NOTIFICATIONS',
        x: 400,
        y: 250,
        fields: [
          { name: 'notification_id', type: 'BIGINT PK', key: true },
          { name: 'user_id', type: 'FK → User' },
          { name: 'title', type: 'VARCHAR(255)' },
          { name: 'message', type: 'CLOB' },
          { name: 'type', type: 'VARCHAR(50)' },
          { name: 'is_read', type: 'BOOLEAN' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      {
        id: 'notif_settings',
        name: 'NOTIFICATION_SETTINGS',
        x: 850,
        y: 250,
        fields: [
          { name: 'user_id', type: 'BIGINT PK FK', key: true },
          { name: 'email_enabled', type: 'BOOLEAN' },
          { name: 'push_enabled', type: 'BOOLEAN' },
          { name: 'sms_enabled', type: 'BOOLEAN' }
        ]
      }
    ];

    this.drawEntities(g, entities);

    const relationships = [
      { from: 'notification', to: 'notif_settings', type: 'one-to-one', label: 'configures' }
    ];

    this.drawRelationships(g, entities, relationships);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('ER Diagram: Notification Entities');

    return svg.node();
  }

  /**
   * ER Diagram: Analytics Entities (Fig 5-6)
   */
  createAnalyticsERDiagram(containerId) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1200;
    const height = 600;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    const entities = [
      {
        id: 'gym_analytics',
        name: 'GYM_ANALYTICS',
        x: 400,
        y: 250,
        fields: [
          { name: 'analytics_id', type: 'BIGINT PK', key: true },
          { name: 'gym_id', type: 'FK → Gym' },
          { name: 'period_date', type: 'DATE' },
          { name: 'active_members', type: 'INT' },
          { name: 'total_revenue', type: 'DECIMAL(10,2)' },
          { name: 'new_members', type: 'INT' },
          { name: 'sessions_completed', type: 'INT' }
        ]
      },
      {
        id: 'trainer_stats',
        name: 'TRAINER_STATS',
        x: 850,
        y: 250,
        fields: [
          { name: 'stats_id', type: 'BIGINT PK', key: true },
          { name: 'trainer_id', type: 'FK → User' },
          { name: 'period_date', type: 'DATE' },
          { name: 'sessions_count', type: 'INT' },
          { name: 'avg_rating', type: 'DECIMAL(3,2)' },
          { name: 'active_clients', type: 'INT' }
        ]
      }
    ];

    this.drawEntities(g, entities);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text('ER Diagram: Analytics & Statistics Entities');

    return svg.node();
  }

  /**
   * Generic DFD builder helper
   */
  _createGenericDFD(containerId, config) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = 1200;
    const height = 700;
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', '#ffffff');

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    // Arrow marker
    const defs = g.append('defs');
    defs.append('marker')
      .attr('id', `arrow-${containerId}`)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#94a3b8');

    // Draw actors
    config.actors.forEach(actor => {
      g.append('circle')
        .attr('cx', actor.x)
        .attr('cy', actor.y)
        .attr('r', 45)
        .attr('fill', '#fef3c7')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', actor.x)
        .attr('y', actor.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 'bold')
        .attr('fill', '#78350f')
        .text(actor.label);
    });

    // Draw processes
    config.processes.forEach(proc => {
      g.append('circle')
        .attr('cx', proc.x)
        .attr('cy', proc.y)
        .attr('r', 55)
        .attr('fill', '#dbeafe')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 3);

      const lines = proc.label.split('\n');
      lines.forEach((line, i) => {
        g.append('text')
          .attr('x', proc.x)
          .attr('y', proc.y + (i - lines.length / 2 + 0.5) * 15)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', 12)
          .attr('font-weight', 'bold')
          .attr('fill', '#1e40af')
          .text(line);
      });
    });

    // Draw data stores
    config.dataStores.forEach(store => {
      g.append('rect')
        .attr('x', store.x - 70)
        .attr('y', store.y - 25)
        .attr('width', 140)
        .attr('height', 50)
        .attr('fill', '#f0fdf4')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('rx', 5);

      g.append('line')
        .attr('x1', store.x - 60)
        .attr('y1', store.y - 25)
        .attr('x2', store.x - 60)
        .attr('y2', store.y + 25)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', store.x)
        .attr('y', store.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 'bold')
        .attr('fill', '#065f46')
        .text(store.label);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 'bold')
      .attr('fill', '#0f172a')
      .text(config.title);

    return svg.node();
  }
}

// Export for use
window.D3DiagramBuilder = D3DiagramBuilder;
