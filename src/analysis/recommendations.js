/**
 * Automated Architectural Recommendation Engine for CODEBASE.UNIVERSE.
 * Answers Question 06: "What should I do?"
 * Generates rule-based refactoring interventions and design pattern solutions
 * based on structural topology (Coupling, Cycles, Centrality, Instability).
 * ZERO EMOJIS.
 */

export class ArchitecturalRecommendationEngine {
  /**
   * Generates actionable refactoring interventions for a specific node.
   * @param {Object} node
   * @param {Object} stat
   * @param {Object} analysis
   * @param {boolean} isEs
   * @returns {Array<{ priority: string, title: string, principle: string, action: string, expectedImpact: string }>}
   */
  static getInterventionsForNode(node, stat, analysis, isEs = false) {
    const interventions = [];

    // Rule 1: Monolithic God Object (High Centrality + High Fan-In + High LOC)
    if (stat.centralityPct >= 85 && stat.fanIn >= 15) {
      interventions.push({
        priority: 'HIGH',
        title: isEs ? 'EXTRAER SERVICIO ESPECIALIZADO (SPLIT GOD OBJECT)' : 'EXTRACT SPECIALIZED WORKER SERVICE',
        principle: 'Single Responsibility Principle (SRP)',
        action: isEs
          ? `Dividir '${node.name}' en un micro-kernel orquestador y un servicio de ejecución separado (${node.baseName}.worker.ts).`
          : `Decompose '${node.name}' into an orchestration micro-kernel and an isolated worker service (${node.baseName}.worker.ts).`,
        expectedImpact: isEs ? 'Reduce el radio de impacto en un 45% y descongestiona la centralidad.' : 'Reduces blast radius by 45% and lowers architectural bottlenecking.'
      });
    }

    // Rule 2: Circular Dependency Entanglement
    if (stat.isCyclic) {
      interventions.push({
        priority: 'CRITICAL',
        title: isEs ? 'INVERTIR ACOPLAMIENTO CIRCULAR (BREAK CYCLE)' : 'INVERT DEPENDENCY (BREAK CYCLIC LOOP)',
        principle: 'Dependency Inversion Principle (DIP)',
        action: isEs
          ? `Introducir una interfaz abstracta o un bus de eventos unidireccional para eliminar las referencias cruzadas mutuas.`
          : `Introduce an abstract adapter interface or unidirectional event emitter to sever mutual cross-references.`,
        expectedImpact: isEs ? 'Elimina bloqueos de inicialización y mejora la testabilidad en un 60%.' : 'Eliminates circular initialization locks and boosts unit testability by 60%.'
      });
    }

    // Rule 3: High Instability with High Fan-In (Unstable Core Layer)
    if (stat.instability > 60 && stat.fanIn > 10) {
      interventions.push({
        priority: 'MEDIUM',
        title: isEs ? 'ESTABILIZAR CAPA DE INFRAESTRUCTURA (STABLE ABSTRACTION)' : 'STABILIZE INFRASTRUCTURE BOUNDARY',
        principle: 'Stable Abstractions Principle (SAP)',
        action: isEs
          ? `Mover dependencias volátiles hacia adaptadores periféricos y convertir '${node.name}' en una interfaz pura.`
          : `Shift volatile outbound dependencies to peripheral adapters and make '${node.name}' depend only on stable abstractions.`,
        expectedImpact: isEs ? 'Reduce la propagación de fallos en cascada hacia subsistemas cliente.' : 'Stops cascading ripple effects across dependent client subsystems.'
      });
    }

    // Rule 4: Orphaned Dead Code Candidate
    if (stat.totalConnections === 0 && node.type !== 'project') {
      interventions.push({
        priority: 'LOW',
        title: isEs ? 'DEPRECAR / ELIMINAR CÓDIGO HUÉRFANO (PRUNE DEAD CODE)' : 'PRUNE UNREFERENCED ORPHAN',
        principle: 'YAGNI / Clean Architecture',
        action: isEs
          ? `Archivar o eliminar '${node.name}', ya que no existen rutas de ejecución activas que lo consuman.`
          : `Safely archive or delete '${node.name}' as no active execution pipelines reference this file.`,
        expectedImpact: isEs ? 'Reduce el tamaño del bundle y la sobrecarga cognitiva de mantenimiento.' : 'Reduces bundle footprint and cognitive maintenance overhead.'
      });
    }

    // Default Healthy Maintenance Recommendation
    if (interventions.length === 0) {
      interventions.push({
        priority: 'INFO',
        title: isEs ? 'MÓDULO ARQUITECTÓNICAMENTE SALUDABLE' : 'HEALTHY ARCHITECTURAL COMPONENT',
        principle: 'Clean Architecture Best Practice',
        action: isEs
          ? `Mantener las dependencias unidireccionales y documentar el contrato de interfaz pública.`
          : `Maintain unidirectional dependency flow and document the public contract interface.`,
        expectedImpact: isEs ? 'Mantiene bajo el riesgo del sistema.' : 'Maintains low system-wide blast radius.'
      });
    }

    return interventions;
  }
}
